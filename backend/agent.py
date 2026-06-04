"""
Natural-language search agent for SweatTogether.

This module sits ALONGSIDE the existing ML matching system in `matching_algo.py`.
It registers a new `POST /agent-match` route on the *same* FastAPI app so that
`/match` (filter-based ML ranking) and `/agent-match` (natural-language search)
are both served on http://127.0.0.1:8000.

Pipeline for /agent-match:
  1. Parse the NL query into structured filters using LLaMA-3.1-8B.
  2. Apply those filters to the candidate users.
  3. Rank the filtered candidates with the EXISTING ML logic from matching_algo.
  4. Generate a short natural-language explanation of the top matches.

Run with:
    uvicorn agent:app --host 127.0.0.1 --port 8000 --reload
"""

import os
import re
import json
import time
import logging
from typing import List, Optional, Dict, Any

import httpx
from pydantic import BaseModel

# Reuse the existing app and ML logic. Registering the route on the imported
# `app` means /match is untouched and both endpoints share one server.
from matching_algo import (
    app,
    UserProfile,
    Location,
    compute_weighted_score,
    haversine_distance_km,
    ALL_WORKOUTS,
    LEVEL_ORDER,
)
from recommender import WorkoutCFModel, get_embedder

logger = logging.getLogger("agent")


def _load_dotenv() -> None:
    """Load KEY=VALUE pairs from backend/.env into the environment.

    Zero-dependency loader (the Python services don't use python-dotenv).
    Existing environment variables take precedence, so a real shell export
    always wins over the file.
    """
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception as e:  # noqa: BLE001 - never block startup on env parsing
        logger.warning(f"Could not read .env: {e}")


_load_dotenv()

# -----------------------
# LLM configuration
# -----------------------
# OpenAI-compatible chat-completions endpoint. Defaults to Groq's hosted
# LLaMA-3.1-8B. Works with any compatible provider (Groq, Together, Ollama, ...)
# by overriding the env vars below. If no API key is configured (or the call
# fails) the agent gracefully falls back to a deterministic keyword parser so
# the endpoint always works in local dev.
LLM_API_BASE = os.environ.get("LLM_API_BASE", "https://api.groq.com/openai/v1")
LLM_API_KEY = os.environ.get("LLM_API_KEY") or os.environ.get("GROQ_API_KEY")
LLM_MODEL = os.environ.get("LLM_MODEL", "llama-3.1-8b-instant")
# Default is generous because local models (Ollama) can take 30s+ on a cold
# start while the weights load into memory. Subsequent calls are much faster.
LLM_TIMEOUT_S = float(os.environ.get("LLM_TIMEOUT_S", "60"))
# Retries on HTTP 429 (rate limit) before falling back to the keyword parser.
LLM_MAX_RETRIES = int(os.environ.get("LLM_MAX_RETRIES", "3"))


def _is_local_endpoint(base: str) -> bool:
    """Local providers like Ollama don't require an API key."""
    return any(host in base for host in ("localhost", "127.0.0.1", "0.0.0.0", ":11434"))


# The LLM is "configured" if we have an API key (hosted providers like Groq) OR
# the endpoint is a local server like Ollama, which needs no key.
LLM_ENABLED = bool(LLM_API_KEY) or _is_local_endpoint(LLM_API_BASE)

# Default reference location used for distance scoring when the searching user
# is not present in `all_users`. Matches the frontend's default (Manhattan, US).
DEFAULT_REFERENCE_ZIP = "10001"
DEFAULT_REFERENCE_COUNTRY = "United States"


# -----------------------
# Request / response models
# -----------------------
class AgentMatchRequest(BaseModel):
    query: str
    user_id: str
    all_users: List[UserProfile]
    top_k: int = 3


class ParsedFilters(BaseModel):
    activities: List[str] = []
    availability: str = ""
    level: str = ""
    max_distance_km: Optional[float] = None


# -----------------------
# LLM helpers
# -----------------------
def _llm_chat(
    messages: List[Dict[str, str]],
    *,
    temperature: float = 0.0,
    max_tokens: int = 400,
    json_mode: bool = False,
) -> Optional[str]:
    """Call an OpenAI-compatible chat-completions endpoint. Returns the message
    content string, or None if the LLM is not configured / the call fails.

    json_mode constrains the response to a JSON object (supported by Groq and
    Ollama's OpenAI-compatible API), which makes filter extraction more robust.
    """
    if not LLM_ENABLED:
        logger.info("No LLM configured (set LLM_API_KEY or a local LLM_API_BASE); using deterministic fallback.")
        return None
    headers = {"Content-Type": "application/json"}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"
    payload: Dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    # Retry on rate limits (Groq's free tier returns 429s under bursts),
    # honoring Retry-After when present, before giving up to the fallback.
    for attempt in range(LLM_MAX_RETRIES + 1):
        try:
            resp = httpx.post(url, headers=headers, json=payload, timeout=LLM_TIMEOUT_S)
            if resp.status_code == 429 and attempt < LLM_MAX_RETRIES:
                wait = float(resp.headers.get("retry-after", 2 * (attempt + 1)))
                logger.warning(f"LLM rate-limited (429); retrying in {wait:.1f}s.")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:  # noqa: BLE001 - any failure should fall back
            logger.warning(f"LLM call failed, falling back: {e}")
            return None
    return None


FILTER_SYSTEM_PROMPT = (
    "You are a parser for a workout-partner matching app. Convert the user's "
    "request into STRICT JSON with exactly these keys:\n"
    '  "activities": an array of strings, each EXACTLY one of: '
    + ", ".join(ALL_WORKOUTS)
    + "\n"
    '  "availability": one short lowercase string (e.g. "mornings", "weekends", '
    '"weekday evenings") or "" if unspecified\n'
    '  "level": one of ["Beginner", "Intermediate", "Advanced"] or "" if unspecified\n'
    '  "max_distance_km": a number in kilometers (convert miles to km) or null if unspecified\n'
    "Map synonyms to the closest allowed activity (e.g. 'lifting' -> 'Weightlifting', "
    "'biking' -> 'Cycling', 'climbing' -> 'Rock Climbing', 'run' -> 'Running'). "
    "Only include values the user clearly implies; otherwise use [] / \"\" / null. "
    "Output ONLY the JSON object with no surrounding prose or code fences."
)


def parse_query_with_llm(query: str) -> Optional[ParsedFilters]:
    """Use the LLM to extract structured filters. Returns None on any failure."""
    content = _llm_chat(
        [
            {"role": "system", "content": FILTER_SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        json_mode=True,
    )
    if not content:
        return None
    try:
        # Be tolerant of code fences or stray text around the JSON object.
        match = re.search(r"\{.*\}", content, re.DOTALL)
        raw = match.group(0) if match else content
        parsed = json.loads(raw)
        return _normalize_filters(parsed)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Failed to parse LLM filter output, falling back: {e}")
        return None


# -----------------------
# Deterministic fallback parser
# -----------------------
_ACTIVITY_SYNONYMS = {
    "lift": "Weightlifting",
    "lifting": "Weightlifting",
    "weights": "Weightlifting",
    "gym": "Weightlifting",
    "run": "Running",
    "runner": "Running",
    "jog": "Jogging",
    "bike": "Cycling",
    "biking": "Cycling",
    "cycle": "Cycling",
    "spin": "Cycling",
    "climb": "Rock Climbing",
    "climbing": "Rock Climbing",
    "bouldering": "Rock Climbing",
    "swim": "Swimming",
    "box": "Boxing",
    "boxing": "Boxing",
    "hike": "Hiking",
    "hiking": "Hiking",
    "walk": "Walking",
    "dance": "Dancing",
    "yoga": "Yoga",
    "pilates": "Pilates",
    "crossfit": "CrossFit",
    "hiit": "HIIT",
    "calisthenics": "Calisthenics",
}

_LEVEL_SYNONYMS = {
    "beginner": "Beginner",
    "newbie": "Beginner",
    "new": "Beginner",
    "novice": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
    "expert": "Advanced",
    "pro": "Advanced",
    "experienced": "Advanced",
}

_AVAILABILITY_KEYWORDS = [
    "mornings", "morning", "afternoons", "afternoon", "evenings", "evening",
    "nights", "night", "weekends", "weekend", "weekdays", "weekday",
]


def parse_query_fallback(query: str) -> ParsedFilters:
    """Deterministic keyword-based parser used when the LLM is unavailable."""
    q = query.lower()

    activities: List[str] = []
    for workout in ALL_WORKOUTS:
        if workout.lower() in q and workout not in activities:
            activities.append(workout)
    for token, workout in _ACTIVITY_SYNONYMS.items():
        if re.search(rf"\b{re.escape(token)}\b", q) and workout not in activities:
            activities.append(workout)

    level = ""
    for token, lvl in _LEVEL_SYNONYMS.items():
        if re.search(rf"\b{re.escape(token)}\b", q):
            level = lvl
            break

    availability = ""
    for token in _AVAILABILITY_KEYWORDS:
        if re.search(rf"\b{re.escape(token)}\b", q):
            availability = token
            break

    max_distance_km: Optional[float] = None
    dist_match = re.search(r"(\d+(?:\.\d+)?)\s*(km|kilometers?|mi|miles?)", q)
    if dist_match:
        value = float(dist_match.group(1))
        unit = dist_match.group(2)
        max_distance_km = round(value * 1.60934, 1) if unit.startswith("mi") else value

    return ParsedFilters(
        activities=activities,
        availability=availability,
        level=level,
        max_distance_km=max_distance_km,
    )


def _normalize_filters(parsed: Dict[str, Any]) -> ParsedFilters:
    """Coerce raw LLM/JSON output into a clean ParsedFilters within our vocab."""
    valid_workouts = {w.lower(): w for w in ALL_WORKOUTS}
    activities: List[str] = []
    for a in parsed.get("activities") or []:
        if not isinstance(a, str):
            continue
        canonical = valid_workouts.get(a.strip().lower())
        if canonical and canonical not in activities:
            activities.append(canonical)

    level = parsed.get("level") or ""
    if isinstance(level, str):
        level = level.strip().capitalize()
        if level not in LEVEL_ORDER:
            level = ""
    else:
        level = ""

    availability = parsed.get("availability") or ""
    availability = availability.strip() if isinstance(availability, str) else ""

    max_distance_km = parsed.get("max_distance_km")
    try:
        max_distance_km = float(max_distance_km) if max_distance_km is not None else None
    except (TypeError, ValueError):
        max_distance_km = None

    return ParsedFilters(
        activities=activities,
        availability=availability,
        level=level,
        max_distance_km=max_distance_km,
    )


# -----------------------
# Filtering + ranking
# -----------------------
def _reference_location(all_users: List[UserProfile], user_id: str) -> Location:
    """Use the searching user's location if present, else a sensible default."""
    for u in all_users:
        if str(u.id) == str(user_id) and u.location:
            return u.location
    return Location(zip_code=DEFAULT_REFERENCE_ZIP, country=DEFAULT_REFERENCE_COUNTRY)


def _build_reference_user(filters: ParsedFilters, location: Location) -> UserProfile:
    """Synthesize a reference user from the parsed filters so the existing ML
    scorer ranks candidates by how well they fit the query."""
    return UserProfile(
        id=-1,
        name="Query",
        age=25,
        level=filters.level or "Beginner",
        gender="",
        location=location,
        workout_preferences=filters.activities or [],
    )


# Maximum boost added to a candidate's ML score when their availability fully
# overlaps the requested availability. Kept small so availability is a SOFT
# signal: it nudges ranking without ever excluding candidates.
AVAILABILITY_BONUS = 0.2

# Blend weights for the agent's combined ranker. The agent fuses three signals:
#   - weighted_model: the existing hand-weighted feature similarity (matching_algo)
#   - cf:             item-based collaborative-filtering activity affinity
#   - embedding:      semantic similarity between the NL query and each profile
# (/match still uses the weighted model alone; this combined ranker is the agent's.)
COMBINED_WEIGHTS = {"weighted_model": 0.5, "cf": 0.2, "embedding": 0.3}

# Map free-text availability phrasing to the canonical preset tags used on
# profiles. Substring-based so "mornings", "in the morning", etc. all match.
_AVAILABILITY_TAG_MAP = {
    "early": {"Early mornings"},
    "morning": {"Early mornings", "Mornings"},
    "afternoon": {"Afternoons"},
    "evening": {"Evenings"},
    "night": {"Nights"},
    "weekday": {"Weekdays"},
    "weekend": {"Weekends"},
}


def availability_to_tags(text: str) -> set:
    """Convert a free-text availability description into canonical preset tags."""
    tags: set = set()
    if not text:
        return tags
    lowered = text.lower()
    for keyword, mapped in _AVAILABILITY_TAG_MAP.items():
        if keyword in lowered:
            tags |= mapped
    return tags


def availability_overlap_ratio(requested_tags: set, candidate_availability: List[str]) -> float:
    """Fraction of the requested availability tags the candidate also has (0..1)."""
    if not requested_tags:
        return 0.0
    cand_tags = set(candidate_availability or [])
    return len(requested_tags & cand_tags) / len(requested_tags)


def apply_filters(
    candidates: List[UserProfile],
    filters: ParsedFilters,
    reference_location: Location,
    user_id: str,
) -> List[Dict[str, Any]]:
    """Hard-filter candidates by the parsed filters. Returns a list of
    {candidate, distance_km} dicts for candidates that pass."""
    activity_set = {a.lower() for a in filters.activities}
    passed: List[Dict[str, Any]] = []

    for cand in candidates:
        if str(cand.id) == str(user_id):
            continue

        # Activity overlap (if any activities were requested)
        if activity_set:
            cand_prefs = {p.lower() for p in (cand.workout_preferences or [])}
            if not (activity_set & cand_prefs):
                continue

        # Level (if requested)
        if filters.level and cand.level != filters.level:
            continue

        # Distance (only computed when a max distance was requested)
        dist_km = None
        if filters.max_distance_km is not None:
            dist_km = haversine_distance_km(
                reference_location.zip_code if reference_location else None,
                reference_location.country if reference_location else None,
                cand.location.zip_code if cand.location else None,
                cand.location.country if cand.location else None,
            )
            # Only exclude when we could actually compute a distance.
            if dist_km is not None and dist_km > filters.max_distance_km:
                continue

        passed.append({"candidate": cand, "distance_km": dist_km})

    return passed


# -----------------------
# Explanation
# -----------------------
def generate_explanation(query: str, filters: ParsedFilters, top_matches: List[Dict[str, Any]]) -> str:
    """Use the LLM to explain the top matches; fall back to a template."""
    if not top_matches:
        return "No partners matched that description. Try broadening your request."

    summary_lines = []
    for m in top_matches:
        p = m["profile"]
        summary_lines.append(
            f"- {p['name']} ({p['level']}, likes {', '.join(p.get('workout_preferences', []) or [])}; "
            f"score {round(m['score'] * 100)}%)"
        )
    matches_block = "\n".join(summary_lines)

    content = _llm_chat(
        [
            {
                "role": "system",
                "content": (
                    "You explain workout-partner matches in a friendly, concise way. "
                    "Given the user's request and the top matches, write 1-2 sentences "
                    "explaining why these partners fit. Do not invent details not present."
                ),
            },
            {
                "role": "user",
                "content": (
                    f'User request: "{query}"\n'
                    f"Extracted filters: {filters.dict()}\n"
                    f"Top matches:\n{matches_block}\n\n"
                    "Write the explanation:"
                ),
            },
        ],
        temperature=0.4,
        max_tokens=120,
    )
    if content:
        return content.strip()

    # Deterministic fallback explanation.
    names = ", ".join(m["profile"]["name"] for m in top_matches)
    bits = []
    if filters.activities:
        bits.append(f"share your interest in {', '.join(filters.activities)}")
    if filters.level:
        bits.append(f"are at the {filters.level} level")
    if filters.availability:
        bits.append(f"tend to be free in the {filters.availability}")
    if filters.max_distance_km is not None:
        bits.append(f"are within {filters.max_distance_km:g} km")
    reason = " and ".join(bits) if bits else "are strong overall fits"
    return f"{names} {reason}, making them great workout-partner candidates."


# -----------------------
# Endpoint
# -----------------------
@app.post("/agent-match")
def agent_match(request: AgentMatchRequest):
    """Natural-language workout-partner search.

    Accepts: { "query": str, "user_id": str, "all_users": ProfileModel[] }
    Returns: { "matches": [{profile, score}], "explanation": str, "parsed_filters": {...} }
    """
    query = (request.query or "").strip()
    candidates = request.all_users or []
    top_k = max(1, int(request.top_k or 3))

    # 1. Parse the query (LLM with deterministic fallback).
    filters = parse_query_with_llm(query) if query else None
    if filters is None:
        filters = parse_query_fallback(query)

    # 2. Filter candidates.
    reference_location = _reference_location(candidates, request.user_id)
    filtered = apply_filters(candidates, filters, reference_location, request.user_id)

    # 3. Rank by fusing three signals, then apply availability as a SOFT boost:
    #      (a) the existing weighted feature model (matching_algo),
    #      (b) item-based collaborative-filtering activity affinity, and
    #      (c) semantic embedding similarity between the query and each profile.
    reference_user = _build_reference_user(filters, reference_location)
    requested_availability = availability_to_tags(filters.availability)

    # Learn workout co-occurrence from the candidate population for CF, and embed
    # the free-text query for semantic matching (batched for efficiency).
    cf_model = WorkoutCFModel(candidates)
    filtered_candidates = [item["candidate"] for item in filtered]
    embedding_sims = (
        get_embedder().rank_similarities(query, filtered_candidates)
        if query else [0.0] * len(filtered_candidates)
    )

    results: List[Dict[str, Any]] = []
    for item, emb_sim in zip(filtered, embedding_sims):
        cand = item["candidate"]
        base_score = compute_weighted_score(cand, reference_user, item["distance_km"])
        cf_affinity = cf_model.affinity(reference_user.workout_preferences, cand.workout_preferences)
        combined = (
            COMBINED_WEIGHTS["weighted_model"] * base_score
            + COMBINED_WEIGHTS["cf"] * cf_affinity
            + COMBINED_WEIGHTS["embedding"] * emb_sim
        )
        overlap = availability_overlap_ratio(requested_availability, cand.availability)
        score = min(1.0, combined + AVAILABILITY_BONUS * overlap)
        results.append({
            "profile": cand.dict(),
            "score": score,
            "distance_km": item["distance_km"],
        })

    results.sort(key=lambda r: (r["score"], -(r["distance_km"] or 9999)), reverse=True)
    top_matches = results[:top_k]

    # 4. Explain the top matches (focus the explanation on the best few).
    explanation = generate_explanation(query, filters, top_matches[:3])

    return {
        "matches": [{"profile": m["profile"], "score": m["score"]} for m in top_matches],
        "explanation": explanation,
        "parsed_filters": filters.dict(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agent:app", host="127.0.0.1", port=8000, reload=True)

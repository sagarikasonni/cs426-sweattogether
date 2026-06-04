import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import logging
import math
import numpy as np
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from sklearn.metrics.pairwise import cosine_similarity

# -----------------------
# Basic config / logging
# -----------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("matching")

app = FastAPI(title="SweatTogether Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Pydantic models
# -----------------------
class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    name: str
    age: int
    image: Optional[str] = None
    bio: Optional[str] = ""
    level: str
    gender: str
    location: Location
    workout_preferences: List[str]
    # Optional: preset availability tags (e.g. "Early mornings", "Weekends").
    # Defaulted so the existing /match flow is unaffected; only the agent uses it.
    availability: List[str] = []

class MatchRequest(BaseModel):
    current_user: UserProfile
    all_users: List[UserProfile]
    top_k: int = 3

# -----------------------
# Constants & utils
# -----------------------
ALL_WORKOUTS = [
    "Balance exercises", "Boxing", "Calisthenics", "Circuit training", "CrossFit",
    "Cycling", "Dancing", "HIIT", "Hiking", "Jogging", "Pilates", "Rock Climbing",
    "Running", "Swimming", "Walking", "Weightlifting", "Yoga", "Other"
]

LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced"]

# Tunable weights for final score (sum should ideally be 1.0 but normalization ensures 0-1)
DEFAULT_WEIGHTS = {
    "workout_overlap": 0.40,
    "level_similarity": 0.10,
    "gender_similarity": 0.15,
    "age_similarity": 0.10,
    "distance_similarity": 0.25
}

# Geolocation helpers
geolocator = Nominatim(user_agent="sweattogether-matching")
_zip_cache: Dict[str, Optional[tuple]] = {}

def load_mock_profiles():
    try:
        profiles_path = os.path.join(os.path.dirname(__file__), '..', 'mockData', 'MockProfiles.json')
        with open(profiles_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load mock profiles: {e}")
        return []

MOCK_PROFILES = load_mock_profiles()

def get_coordinates(zip_code: Optional[str], country: Optional[str]) -> Optional[tuple]:
    if not zip_code or not country:
        return None
    key = f"{zip_code},{country}"
    if key in _zip_cache:
        return _zip_cache[key]
    try:
        loc = geolocator.geocode({"postalcode": zip_code, "country": country}, timeout=10)
        if loc:
            coords = (loc.latitude, loc.longitude)
            _zip_cache[key] = coords
            return coords
    except Exception as e:
        logger.debug(f"Geocode error for {zip_code},{country}: {e}")
    _zip_cache[key] = None
    return None

def haversine_distance_km(zip1: Optional[str], country1: Optional[str], zip2: Optional[str], country2: Optional[str]) -> Optional[float]:
    try:
        c1 = get_coordinates(zip1, country1)
        c2 = get_coordinates(zip2, country2)
        if c1 and c2:
            return geodesic(c1, c2).km
    except Exception as e:
        logger.debug(f"Distance calc error: {e}")
    return None

# -----------------------
# Feature / similarity functions
# -----------------------
def workout_overlap_similarity(prefs_a: List[str], prefs_b: List[str]) -> float:
    """Jaccard-like overlap on selected workout strings; returns 0..1."""
    set_a = set([p.lower() for p in prefs_a or []])
    set_b = set([p.lower() for p in prefs_b or []])
    if not set_a or not set_b:
        return 0.0
    inter = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(inter) / max(1, len(union))

def level_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    # closeness by index
    try:
        return 1.0 - (abs(LEVEL_ORDER.index(a) - LEVEL_ORDER.index(b)) / (len(LEVEL_ORDER) - 1))
    except Exception:
        return 0.0

def gender_similarity(a: str, b: str) -> float:
    # simple: same gender = 1, else 0
    if not a or not b:
        return 0.0
    return 1.0 if a.strip().lower() == b.strip().lower() else 0.0

def age_similarity(age_a: int, age_b: int, max_diff: int = 40) -> float:
    diff = abs(age_a - age_b)
    score = max(0.0, 1.0 - (diff / max_diff))
    return score

def distance_similarity_km(dist_km: Optional[float], scale_km: float = 50.0) -> float:
    # Exponential decay: closer -> near 1, far -> near 0
    if dist_km is None:
        # unknown distance -> small penalty but not zero
        return 0.1
    # guard negative
    dist_km = max(0.0, dist_km)
    return math.exp(-dist_km / scale_km)  # scale controls decay rate

# -----------------------
# Core encoding & scoring
# -----------------------
def build_feature_vector(user: UserProfile, reference_user: UserProfile, distance_km: Optional[float]) -> np.ndarray:
    """Return a feature vector for similarity computation (not strictly necessary)."""
    features = [
        workout_overlap_similarity(user.workout_preferences, reference_user.workout_preferences),
        level_similarity(user.level, reference_user.level),
        gender_similarity(user.gender, reference_user.gender),
        age_similarity(user.age, reference_user.age),
        distance_similarity_km(distance_km)
    ]
    return np.array(features, dtype=float)

def compute_weighted_score(user: UserProfile, reference_user: UserProfile, distance_km: Optional[float], weights: Dict[str, float] = None) -> float:
    """Compute a weighted score 0..1 for a single candidate against reference_user."""
    if weights is None:
        weights = DEFAULT_WEIGHTS
    w_workout = weights.get("workout_overlap", 0.4)
    w_level = weights.get("level_similarity", 0.10)
    w_gender = weights.get("gender_similarity", 0.15)
    w_age = weights.get("age_similarity", 0.10)
    w_distance = weights.get("distance_similarity", 0.25)

    s_workout = workout_overlap_similarity(user.workout_preferences, reference_user.workout_preferences)
    s_level = level_similarity(user.level, reference_user.level)
    s_gender = gender_similarity(user.gender, reference_user.gender)
    s_age = age_similarity(user.age, reference_user.age)
    s_distance = distance_similarity_km(distance_km)

    # Weighted sum
    raw_score = (
        w_workout * s_workout +
        w_level * s_level +
        w_gender * s_gender +
        w_age * s_age +
        w_distance * s_distance
    )

    # Ensure normalized to 0..1 (weights should sum to 1 but normalize just in case)
    total_w = w_workout + w_level + w_gender + w_age + w_distance
    if total_w > 0:
        normalized_score = raw_score / total_w
    else:
        normalized_score = raw_score

    # Clip and return
    return float(max(0.0, min(1.0, normalized_score)))

# -----------------------
# FastAPI endpoint
# -----------------------
@app.post("/match")
def match_profiles(request: MatchRequest):
    """
    Expects:
    {
      "current_user": {...},
      "all_users": [{...}, ...],
      "top_k": 3
    }

    Returns:
    {
      "matches": [
        { "profile": {...}, "score": 0.92, "distance_km": 2.3 },
        ...
      ]
    }
    """
    current_user = request.current_user
    candidates = request.all_users or []
    top_k = max(1, int(request.top_k or 3))

    if not candidates:
        raise HTTPException(status_code=400, detail="No candidate users provided")

    results = []

    for cand in candidates:
        if cand.id == current_user.id:
            continue

        dist_km = haversine_distance_km(
            current_user.location.zip_code if current_user.location else None,
            current_user.location.country if current_user.location else None,
            cand.location.zip_code if cand.location else None,
            cand.location.country if cand.location else None
        )

        score = compute_weighted_score(cand, current_user, dist_km)
        results.append({
            "profile": cand.dict(),
            "score": score,
            "distance_km": dist_km if dist_km is not None else None
        })

    # sort by score descending, tie-breaker by distance (closer preferred)
    results.sort(key=lambda r: (r["score"], -(r["distance_km"] or 9999)), reverse=True)

    # return top_k
    top_matches = results[:top_k]

    return {"matches": top_matches}

# -----------------------
# Local run for dev
# -----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("matching_algo:app", host="127.0.0.1", port=8000, reload=True)


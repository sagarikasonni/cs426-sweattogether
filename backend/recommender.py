"""
Recommendation components that augment the agent's ranking:

  1. WorkoutCFModel  - item-based collaborative filtering over the user x workout
     matrix. Learns latent affinities between workout types from the population
     (e.g. people who do CrossFit also tend to lift), so partners are matched on
     *related* activities, not just identical ones.

  2. ProfileEmbedder - semantic text embeddings of profiles / queries. Uses
     sentence-transformers (all-MiniLM-L6-v2) when installed for true dense
     embeddings; otherwise falls back to a lightweight sklearn HashingVectorizer
     so the service (and CI) still works with no heavy dependencies.

Both return scores in [0, 1] so they can be blended with the existing weighted
similarity model in agent.py.
"""
from __future__ import annotations

import logging
from typing import List, Optional, Sequence

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from matching_algo import ALL_WORKOUTS, UserProfile

logger = logging.getLogger("recommender")


# -----------------------
# Item-based collaborative filtering
# -----------------------
class WorkoutCFModel:
    """Item-based CF over a user x workout interaction matrix.

    The "interactions" are which workouts each user has in their preferences.
    Item-item cosine similarity over that matrix captures which workouts tend to
    co-occur across users, letting us reward partners with *related* activities.
    """

    def __init__(self, profiles: Sequence[UserProfile], workouts: Sequence[str] = ALL_WORKOUTS):
        self.workouts: List[str] = list(workouts)
        self.index = {w: i for i, w in enumerate(self.workouts)}

        # user x workout binary matrix
        matrix = np.array(
            [
                [1.0 if w in set(p.workout_preferences or []) else 0.0 for w in self.workouts]
                for p in profiles
            ],
            dtype=float,
        )

        n_workouts = len(self.workouts)
        if matrix.size == 0 or matrix.sum() == 0:
            # Degenerate population: fall back to identity (only exact matches).
            self.item_sim = np.eye(n_workouts)
        else:
            # Each workout is a column vector over users; cosine between columns
            # gives item-item similarity. Zero-usage workouts come out as 0.
            self.item_sim = cosine_similarity(matrix.T)
            np.fill_diagonal(self.item_sim, 1.0)

    def affinity(self, prefs_a: List[str], prefs_b: List[str]) -> float:
        """How well b's activities cover a's interests via learned co-occurrence.

        For each activity the searcher wants, take the best similarity to any of
        the candidate's activities, then average. Returns 0..1.
        """
        a = [w for w in (prefs_a or []) if w in self.index]
        b = [w for w in (prefs_b or []) if w in self.index]
        if not a or not b:
            return 0.0
        b_idx = [self.index[w] for w in b]
        scores = [max(self.item_sim[self.index[wa]][j] for j in b_idx) for wa in a]
        return float(np.clip(np.mean(scores), 0.0, 1.0))


# -----------------------
# Semantic embeddings
# -----------------------
def _profile_to_text(profile: UserProfile) -> str:
    parts = [
        profile.name or "",
        f"Level: {profile.level}." if profile.level else "",
        f"Enjoys {', '.join(profile.workout_preferences)}." if profile.workout_preferences else "",
        f"Available {', '.join(profile.availability)}." if getattr(profile, "availability", None) else "",
        profile.bio or "",
    ]
    return " ".join(p for p in parts if p).strip()


class ProfileEmbedder:
    """Embeds text into vectors and scores cosine similarity in [0, 1].

    Prefers sentence-transformers (dense semantic embeddings); falls back to a
    stateless sklearn HashingVectorizer when the heavy dependency is absent.
    """

    def __init__(self) -> None:
        self._model = None
        self._vectorizer = None
        self.backend = "hashing"
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self.backend = "sentence-transformers"
            logger.info("ProfileEmbedder using sentence-transformers (semantic embeddings).")
        except Exception as e:  # noqa: BLE001 - any failure -> lightweight fallback
            from sklearn.feature_extraction.text import HashingVectorizer

            self._vectorizer = HashingVectorizer(
                n_features=512, alternate_sign=False, norm="l2"
            )
            logger.info(f"ProfileEmbedder using HashingVectorizer fallback ({e}).")

    def _embed(self, texts: List[str]) -> np.ndarray:
        if self._model is not None:
            return np.asarray(self._model.encode(texts, normalize_embeddings=True))
        # HashingVectorizer returns an l2-normalized sparse matrix.
        return self._vectorizer.transform(texts).toarray()

    def similarity(self, query_text: str, profile_text: str) -> float:
        """Semantic similarity between a query and a profile, in [0, 1]."""
        if not query_text or not profile_text:
            return 0.0
        vecs = self._embed([query_text, profile_text])
        sim = float(cosine_similarity(vecs[0:1], vecs[1:2])[0][0])
        return max(0.0, min(1.0, sim))

    def rank_similarities(self, query_text: str, profiles: Sequence[UserProfile]) -> List[float]:
        """Similarity of the query to each profile (0..1), computed in one batch."""
        if not query_text or not profiles:
            return [0.0] * len(profiles)
        texts = [query_text] + [_profile_to_text(p) for p in profiles]
        vecs = self._embed(texts)
        sims = cosine_similarity(vecs[0:1], vecs[1:])[0]
        return [max(0.0, min(1.0, float(s))) for s in sims]


# Singleton embedder: the model/vectorizer is population-independent, so we load
# it once and reuse it across requests (sentence-transformers load is expensive).
_EMBEDDER: Optional[ProfileEmbedder] = None


def get_embedder() -> ProfileEmbedder:
    global _EMBEDDER
    if _EMBEDDER is None:
        _EMBEDDER = ProfileEmbedder()
    return _EMBEDDER

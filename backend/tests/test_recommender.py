"""Unit tests for the CF + embedding recommender components.

These exercise the lightweight fallback paths (no sentence-transformers / torch
required) so they run quickly in CI.
"""
from recommender import WorkoutCFModel, ProfileEmbedder, _profile_to_text
from matching_algo import Location, UserProfile


def make_user(user_id, workouts, bio="", level="Beginner"):
    return UserProfile(
        id=user_id,
        name=f"User{user_id}",
        age=25,
        level=level,
        gender="Female",
        location=Location(zip_code="10001", country="United States"),
        workout_preferences=workouts,
        bio=bio,
    )


# -----------------------
# WorkoutCFModel
# -----------------------
def test_cf_identical_activities_have_high_affinity():
    pop = [make_user(1, ["Running", "Yoga"]), make_user(2, ["Running", "Yoga"])]
    cf = WorkoutCFModel(pop)
    assert cf.affinity(["Running"], ["Running"]) == 1.0


def test_cf_rewards_cooccurring_activities_over_unrelated():
    # Build a population where Running & Jogging always co-occur, while Boxing
    # appears with neither. CF should rate Running~Jogging above Running~Boxing.
    pop = [
        make_user(1, ["Running", "Jogging"]),
        make_user(2, ["Running", "Jogging"]),
        make_user(3, ["Running", "Jogging"]),
        make_user(4, ["Boxing"]),
    ]
    cf = WorkoutCFModel(pop)
    related = cf.affinity(["Running"], ["Jogging"])
    unrelated = cf.affinity(["Running"], ["Boxing"])
    assert related > unrelated
    assert unrelated == 0.0


def test_cf_empty_preferences_return_zero():
    cf = WorkoutCFModel([make_user(1, ["Running"])])
    assert cf.affinity([], ["Running"]) == 0.0
    assert cf.affinity(["Running"], []) == 0.0


def test_cf_handles_empty_population():
    cf = WorkoutCFModel([])
    # Identity fallback: exact match still scores 1.0, others 0.
    assert cf.affinity(["Running"], ["Running"]) == 1.0
    assert cf.affinity(["Running"], ["Boxing"]) == 0.0


# -----------------------
# ProfileEmbedder (fallback backend)
# -----------------------
def test_profile_to_text_includes_key_fields():
    u = make_user(1, ["Running"], bio="Love trail runs", level="Advanced")
    text = _profile_to_text(u)
    assert "Running" in text
    assert "Advanced" in text
    assert "Love trail runs" in text


def test_embedder_similarity_in_unit_range_and_self_similar():
    emb = ProfileEmbedder()
    # Identical text -> similarity ~1.0
    s_self = emb.similarity("running partner", "running partner")
    assert 0.99 <= s_self <= 1.0
    # Unrelated text -> lower than self-similarity, still within [0, 1]
    s_other = emb.similarity("running partner", "completely different words here")
    assert 0.0 <= s_other <= 1.0
    assert s_other < s_self


def test_embedder_rank_similarities_matches_relevant_profile():
    emb = ProfileEmbedder()
    profiles = [
        make_user(1, ["Running"], bio="I love running and jogging every morning"),
        make_user(2, ["Boxing"], bio="Boxing and martial arts enthusiast"),
    ]
    sims = emb.rank_similarities("looking for a running buddy", profiles)
    assert len(sims) == 2
    assert all(0.0 <= s <= 1.0 for s in sims)
    # The running profile should score higher for a running query.
    assert sims[0] > sims[1]

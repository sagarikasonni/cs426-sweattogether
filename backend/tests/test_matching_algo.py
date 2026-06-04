"""Unit tests for the ML partner-scoring logic in matching_algo.py.

These are pure-function tests: no network, no DB, no FastAPI server.
"""
import matching_algo
from matching_algo import UserProfile, Location, compute_weighted_score


def make_user(
    user_id=1,
    age=25,
    level="Intermediate",
    gender="Female",
    workouts=None,
    zip_code="10001",
    country="United States",
):
    return UserProfile(
        id=user_id,
        name=f"User{user_id}",
        age=age,
        level=level,
        gender=gender,
        location=Location(zip_code=zip_code, country=country),
        workout_preferences=workouts if workouts is not None else ["Running", "Yoga"],
    )


def test_identical_users_with_zero_distance_score_is_perfect():
    """Identical users at distance 0 should score 1.0 (every feature maxed)."""
    a = make_user(1, workouts=["Running", "Yoga"])
    b = make_user(2, workouts=["Running", "Yoga"])
    score = compute_weighted_score(a, b, distance_km=0.0)
    assert score == 1.0


def test_zero_shared_workouts_drops_score_by_workout_weight():
    """No workout overlap removes exactly the workout_overlap weight (0.40)."""
    a = make_user(1, workouts=["Running", "Yoga"])
    # Same level/gender/age, distance 0, but no shared workouts.
    b = make_user(2, workouts=["Boxing", "Swimming"])
    score = compute_weighted_score(a, b, distance_km=0.0)
    # Expected: (0*0.40 + 1*0.10 + 1*0.15 + 1*0.10 + 1*0.25) / 1.0 = 0.60
    assert abs(score - 0.60) < 1e-6


def test_max_distance_drives_distance_similarity_to_zero():
    """A very large distance should zero out the distance term only."""
    a = make_user(1, workouts=["Running", "Yoga"])
    b = make_user(2, workouts=["Running", "Yoga"])
    score = compute_weighted_score(a, b, distance_km=100_000.0)
    # All features 1 except distance ~0: (0.40+0.10+0.15+0.10 + ~0*0.25)/1.0 = ~0.75
    assert abs(score - 0.75) < 1e-3


def test_unknown_distance_applies_small_penalty_not_zero():
    """distance_km=None is treated as a small similarity (0.1), not 0."""
    a = make_user(1, workouts=["Running", "Yoga"])
    b = make_user(2, workouts=["Running", "Yoga"])
    score = compute_weighted_score(a, b, distance_km=None)
    # (0.40+0.10+0.15+0.10 + 0.1*0.25)/1.0 = 0.775
    assert abs(score - 0.775) < 1e-6


def test_score_is_always_between_zero_and_one():
    a = make_user(1, age=18, level="Beginner", gender="Male", workouts=["Boxing"])
    b = make_user(2, age=80, level="Advanced", gender="Female", workouts=["Yoga"])
    score = compute_weighted_score(a, b, distance_km=5000.0)
    assert 0.0 <= score <= 1.0


def test_level_similarity_orders_correctly():
    # Same level -> 1.0; adjacent -> 0.5; opposite ends -> 0.0
    assert matching_algo.level_similarity("Beginner", "Beginner") == 1.0
    assert abs(matching_algo.level_similarity("Beginner", "Intermediate") - 0.5) < 1e-6
    assert matching_algo.level_similarity("Beginner", "Advanced") == 0.0


def test_workout_overlap_is_jaccard():
    # {Running} ∩ {Running, Yoga} = 1, union = 2 -> 0.5
    sim = matching_algo.workout_overlap_similarity(["Running"], ["Running", "Yoga"])
    assert abs(sim - 0.5) < 1e-6
    # No overlap -> 0
    assert matching_algo.workout_overlap_similarity(["Running"], ["Boxing"]) == 0.0
    # Empty -> 0
    assert matching_algo.workout_overlap_similarity([], ["Boxing"]) == 0.0

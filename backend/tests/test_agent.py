"""Unit tests for the natural-language agent helpers in agent.py.

Covers the deterministic query parser, the filtering logic, and the
availability soft-overlap helper. No network or LLM calls are made.
"""
import agent
from agent import (
    parse_query_fallback,
    apply_filters,
    availability_to_tags,
    availability_overlap_ratio,
    ParsedFilters,
)
from matching_algo import UserProfile, Location


def make_user(user_id, workouts, level="Beginner", availability=None):
    return UserProfile(
        id=user_id,
        name=f"User{user_id}",
        age=25,
        level=level,
        gender="Female",
        location=Location(zip_code="10001", country="United States"),
        workout_preferences=workouts,
        availability=availability or [],
    )


# -----------------------
# parse_query_fallback
# -----------------------
def test_parse_maps_activity_synonyms():
    f = parse_query_fallback("I want to go lifting and biking")
    assert "Weightlifting" in f.activities
    assert "Cycling" in f.activities


def test_parse_recognizes_canonical_activities():
    f = parse_query_fallback("looking for running and yoga partners")
    assert "Running" in f.activities
    assert "Yoga" in f.activities


def test_parse_converts_miles_to_km():
    f = parse_query_fallback("someone within 10 miles of me")
    # 10 * 1.60934 = 16.0934 -> rounded to 16.1
    assert f.max_distance_km == 16.1


def test_parse_keeps_km_as_is():
    f = parse_query_fallback("partners within 5 km")
    assert f.max_distance_km == 5.0


def test_parse_extracts_level():
    assert parse_query_fallback("an advanced lifter").level == "Advanced"
    assert parse_query_fallback("a total newbie").level == "Beginner"
    assert parse_query_fallback("an expert climber").level == "Advanced"


def test_parse_extracts_availability_keyword():
    assert parse_query_fallback("free on weekends").availability == "weekends"


def test_parse_empty_query_yields_empty_filters():
    f = parse_query_fallback("")
    assert f.activities == []
    assert f.level == ""
    assert f.availability == ""
    assert f.max_distance_km is None


# -----------------------
# apply_filters
# -----------------------
REF_LOCATION = Location(zip_code="10001", country="United States")


def test_filter_by_activity_overlap():
    candidates = [
        make_user(1, ["Running", "Yoga"]),
        make_user(2, ["Boxing"]),
        make_user(3, ["Running"]),
    ]
    filters = ParsedFilters(activities=["Running"])
    passed = apply_filters(candidates, filters, REF_LOCATION, user_id="0")
    ids = {item["candidate"].id for item in passed}
    assert ids == {1, 3}


def test_filter_excludes_searching_user():
    candidates = [make_user(1, ["Running"]), make_user(2, ["Running"])]
    filters = ParsedFilters(activities=["Running"])
    passed = apply_filters(candidates, filters, REF_LOCATION, user_id="1")
    ids = {item["candidate"].id for item in passed}
    assert ids == {2}


def test_filter_by_level():
    candidates = [
        make_user(1, ["Running"], level="Beginner"),
        make_user(2, ["Running"], level="Advanced"),
    ]
    filters = ParsedFilters(activities=["Running"], level="Advanced")
    passed = apply_filters(candidates, filters, REF_LOCATION, user_id="0")
    ids = {item["candidate"].id for item in passed}
    assert ids == {2}


def test_filter_by_distance_cutoff(monkeypatch):
    # Make distance deterministic & offline: id 1 is close, id 2 is far.
    distances = {1: 5.0, 2: 80.0}

    def fake_distance(z1, c1, z2, c2):
        # The candidate's zip encodes which fake distance to return.
        return distances.get(int(z2), None)

    monkeypatch.setattr(agent, "haversine_distance_km", fake_distance)

    candidates = [
        make_user(1, ["Running"]),
        make_user(2, ["Running"]),
    ]
    # Override candidate zips so fake_distance can distinguish them.
    candidates[0].location.zip_code = "1"
    candidates[1].location.zip_code = "2"

    filters = ParsedFilters(activities=["Running"], max_distance_km=10.0)
    passed = apply_filters(candidates, filters, REF_LOCATION, user_id="0")
    ids = {item["candidate"].id for item in passed}
    assert ids == {1}


def test_no_activity_filter_passes_everyone_except_self():
    candidates = [make_user(1, ["Boxing"]), make_user(2, ["Yoga"])]
    filters = ParsedFilters()  # no activities requested
    passed = apply_filters(candidates, filters, REF_LOCATION, user_id="99")
    assert len(passed) == 2


# -----------------------
# availability helpers
# -----------------------
def test_availability_to_tags_maps_morning_to_both_morning_tags():
    tags = availability_to_tags("early mornings")
    assert "Early mornings" in tags
    assert "Mornings" in tags


def test_availability_overlap_ratio():
    requested = {"Early mornings", "Mornings"}
    assert availability_overlap_ratio(requested, ["Early mornings"]) == 0.5
    assert availability_overlap_ratio(requested, ["Early mornings", "Mornings"]) == 1.0
    assert availability_overlap_ratio(requested, ["Evenings"]) == 0.0
    assert availability_overlap_ratio(set(), ["Evenings"]) == 0.0

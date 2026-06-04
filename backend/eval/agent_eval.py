"""
Filter-extraction evaluation harness for the natural-language agent.

Runs the agent's query parser over a labeled benchmark of queries and reports
how accurately it extracts the structured filters (activities, availability,
level, max distance). Produces a single headline accuracy number you can cite.

Usage (from the backend/ directory):
    # With an LLM configured (Groq/Ollama via .env or env vars):
    python eval/agent_eval.py

    # Force the deterministic keyword parser (no LLM):
    python eval/agent_eval.py --fallback

It prints per-field accuracy and overall exact-match accuracy.
"""
import argparse
import json
import os
import sys
import time

# Make backend modules importable when run from anywhere.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import agent  # noqa: E402
from agent import parse_query_fallback, parse_query_with_llm, availability_to_tags  # noqa: E402


def _activities_match(expected, predicted) -> bool:
    return {a.lower() for a in expected} == {a.lower() for a in predicted}


def _availability_match(expected, predicted) -> bool:
    # Compare by canonical availability tags so phrasing differences don't count
    # as errors (e.g. "mornings" vs "early mornings").
    return availability_to_tags(expected) == availability_to_tags(predicted)


def _level_match(expected, predicted) -> bool:
    return (expected or "") == (predicted or "")


def _distance_match(expected, predicted) -> bool:
    if expected is None and predicted is None:
        return True
    if expected is None or predicted is None:
        return False
    return abs(float(expected) - float(predicted)) <= 1.0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fallback", action="store_true", help="Force the deterministic parser (no LLM).")
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="Seconds to sleep between queries (throttle to avoid LLM rate limits).",
    )
    parser.add_argument(
        "--dataset",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "queries.json"),
    )
    args = parser.parse_args()

    with open(args.dataset) as f:
        dataset = json.load(f)

    use_llm = agent.LLM_ENABLED and not args.fallback
    mode = f"LLM ({agent.LLM_MODEL} @ {agent.LLM_API_BASE})" if use_llm else "deterministic fallback"
    print(f"Evaluating {len(dataset)} queries using: {mode}\n")

    fields = ["activities", "availability", "level", "max_distance_km"]
    field_correct = {f: 0 for f in fields}
    exact_correct = 0
    failures = []

    for i, case in enumerate(dataset):
        query = case["query"]
        exp = case["expected"]

        if args.delay and i > 0:
            time.sleep(args.delay)
        parsed = (parse_query_with_llm(query) if use_llm else None) or parse_query_fallback(query)

        checks = {
            "activities": _activities_match(exp["activities"], parsed.activities),
            "availability": _availability_match(exp["availability"], parsed.availability),
            "level": _level_match(exp["level"], parsed.level),
            "max_distance_km": _distance_match(exp["max_distance_km"], parsed.max_distance_km),
        }
        for f in fields:
            field_correct[f] += int(checks[f])
        if all(checks.values()):
            exact_correct += 1
        else:
            failures.append((query, exp, parsed.model_dump(), checks))

    n = len(dataset)
    total_fields = n * len(fields)
    total_field_correct = sum(field_correct.values())

    print("Per-field accuracy:")
    for f in fields:
        print(f"  {f:<16} {field_correct[f]}/{n}  ({100 * field_correct[f] / n:.1f}%)")
    print()
    print(f"Field-level accuracy : {total_field_correct}/{total_fields}  ({100 * total_field_correct / total_fields:.1f}%)")
    print(f"Exact-match accuracy : {exact_correct}/{n}  ({100 * exact_correct / n:.1f}%)")

    if failures:
        print(f"\n{len(failures)} queries with at least one mismatch:")
        for query, exp, got, checks in failures:
            wrong = [f for f, ok in checks.items() if not ok]
            print(f"  - \"{query}\"  (wrong: {', '.join(wrong)})")
            print(f"      expected: {exp}")
            print(f"      got     : {got}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

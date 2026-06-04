"""Make the backend modules importable regardless of pytest's working dir."""
import os
import sys

# Add backend/ (the parent of this tests/ dir) to sys.path so tests can do
# `import matching_algo` and `import agent`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

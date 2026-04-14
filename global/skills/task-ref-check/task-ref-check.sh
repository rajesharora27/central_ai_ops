#!/usr/bin/env bash
set -euo pipefail

# Task Reference Validator — checks commit messages for task ID traceability.

TASKS_DIR="docs/tasks"
COMPLETED_DIR="docs/tasks/completed"
COMMIT_MSG=""

if [[ $# -ge 1 && "$1" != --* && -f "$1" ]]; then
  COMMIT_MSG="$(cat "$1")"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --message)    COMMIT_MSG="$2"; shift 2 ;;
    --tasks-dir)  TASKS_DIR="$2"; shift 2 ;;
    *)            shift ;;
  esac
done

if [[ -z "$COMMIT_MSG" ]]; then
  echo "task-ref-check: no commit message provided"
  exit 1
fi

FIRST_LINE="$(echo "$COMMIT_MSG" | head -1)"

# Exempt: merge commits, skip-ci, auto-patch, initial commit
if echo "$FIRST_LINE" | grep -qiE '^Merge |^\[skip ci\]|^chore:\s*auto-patch|^Initial commit'; then
  exit 0
fi

# Look for task ID pattern: [FEAT-NNN], [FIX-NNN], [CHORE-NNN], or legacy [T-NNN]
TASK_ID=$(echo "$FIRST_LINE" | grep -oE '\[(FEAT|FIX|CHORE|T)-[0-9]+\]' | head -1 | tr -d '[]')

if [[ -z "$TASK_ID" ]]; then
  echo "[WARN] Commit message has no task reference (expected [FEAT-NNN], [FIX-NNN], or [CHORE-NNN])"
  echo "  Message: $FIRST_LINE"
  # Warning only, not blocking
  exit 0
fi

# Check task file exists
TASK_FILE_PATTERN="${TASK_ID}-*.md"
FOUND=0

for dir in "$TASKS_DIR" "$COMPLETED_DIR"; do
  if ls "$dir"/$TASK_FILE_PATTERN 1>/dev/null 2>&1; then
    FOUND=1
    # Check if it's in completed
    if [[ "$dir" == "$COMPLETED_DIR" ]]; then
      echo "[WARN] Task $TASK_ID is in completed/ — verify it should be reopened"
    fi
    break
  fi
done

if [[ "$FOUND" -eq 0 ]]; then
  echo "[WARN] Task file for $TASK_ID not found in $TASKS_DIR or $COMPLETED_DIR"
fi

exit 0

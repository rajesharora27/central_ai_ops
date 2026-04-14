#!/usr/bin/env bash
set -euo pipefail

# SRW Architecture Audit — portable, no project-specific assumptions.
# Detects inline DB queries in handler/workflow files and orchestration leaks in skill files.

SCAN_PATH="${1:-supabase/functions/app-api}"
HANDLERS_SUBDIR="handlers"
SKILLS_SUBDIR="skills"
STAGED=0
CI_MODE=0
EXIT_CODE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)       SCAN_PATH="$2"; shift 2 ;;
    --handlers)   HANDLERS_SUBDIR="$2"; shift 2 ;;
    --skills)     SKILLS_SUBDIR="$2"; shift 2 ;;
    --staged)     STAGED=1; shift ;;
    --ci)         CI_MODE=1; shift ;;
    *)            shift ;;
  esac
done

HANDLER_DIR="$SCAN_PATH/$HANDLERS_SUBDIR"
SKILL_DIR="$SCAN_PATH/$SKILLS_SUBDIR"

get_files() {
  local dir="$1"
  if [[ "$STAGED" -eq 1 ]]; then
    git diff --cached --name-only --diff-filter=ACMR -- "$dir" 2>/dev/null || true
  else
    find "$dir" -name '*.ts' -o -name '*.js' 2>/dev/null || true
  fi
}

# --- Check handlers for inline DB queries ---
if [[ -d "$HANDLER_DIR" ]]; then
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ ! -f "$file" ]] && continue

    # .from() calls — inline Supabase queries (skip Array.from, Object.from, etc.)
    while IFS=: read -r lineno line; do
      # Skip import/require lines and comments
      if echo "$line" | grep -qE '^\s*(import|//|/?\*)'; then continue; fi
      # Skip standard JS methods: Array.from, Object.fromEntries, Buffer.from, etc.
      if echo "$line" | grep -qE '(Array|Object|Buffer|Set|Map|String)\.from\('; then continue; fi
      echo "$file:$lineno: [BLOCK] .from() call in handler — delegate to skills/"
      EXIT_CODE=1
    done < <(grep -n '\.from(' "$file" 2>/dev/null || true)

    # Direct SQL string literals
    while IFS=: read -r lineno line; do
      if echo "$line" | grep -qE '^\s*(//|/?\*)'; then continue; fi
      echo "$file:$lineno: [BLOCK] Direct SQL string in handler — delegate to skills/"
      EXIT_CODE=1
    done < <(grep -nE "(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+.+\s+SET|DELETE\s+FROM)" "$file" 2>/dev/null || true)

  done < <(get_files "$HANDLER_DIR")
fi

# --- Check skills for orchestration leaks ---
if [[ -d "$SKILL_DIR" ]]; then
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ ! -f "$file" ]] && continue

    # Nested retry/orchestration patterns (heuristic: 3+ catch blocks in one file)
    catch_count=$(grep -c 'catch *(' "$file" 2>/dev/null || true)
    catch_count="${catch_count:-0}"
    catch_count="${catch_count##*[!0-9]}"
    : "${catch_count:=0}"
    if [[ "$catch_count" -ge 3 ]]; then
      echo "$file:1: [WARN] $catch_count catch blocks — possible orchestration leak in skill"
    fi

  done < <(get_files "$SKILL_DIR")
fi

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "SRW audit: PASS"
else
  echo ""
  echo "SRW audit: FAIL — fix BLOCK findings before committing"
fi

exit "$EXIT_CODE"

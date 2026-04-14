#!/usr/bin/env bash
set -euo pipefail

# Migration Safety Validator — portable, works with any sequential-numbered SQL migration directory.

MIGRATION_DIR="supabase/migrations"
STAGED=0
SINGLE_FILE=""
SINCE=""
EXIT_CODE=0
BLOCK_COUNT=0
WARN_COUNT=0
INFO_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)   MIGRATION_DIR="$2"; shift 2 ;;
    --staged) STAGED=1; shift ;;
    --file)   SINGLE_FILE="$2"; shift 2 ;;
    --since)  SINCE="$2"; shift 2 ;;
    *)        shift ;;
  esac
done

get_files() {
  if [[ -n "$SINGLE_FILE" ]]; then
    echo "$SINGLE_FILE"
  elif [[ "$STAGED" -eq 1 ]]; then
    git diff --cached --name-only --diff-filter=ACMR -- "$MIGRATION_DIR" 2>/dev/null | grep '\.sql$' || true
  else
    local files
    files=$(find "$MIGRATION_DIR" -name '*.sql' -type f 2>/dev/null | sort || true)
    if [[ -n "$SINCE" ]]; then
      # Only include files with numeric prefix >= SINCE
      echo "$files" | while IFS= read -r f; do
        local prefix
        prefix=$(basename "$f" | sed 's/_.*//')
        if [[ "$prefix" =~ ^[0-9]+$ ]] && [[ "10#$prefix" -ge "10#$SINCE" ]]; then
          echo "$f"
        fi
      done
    else
      echo "$files"
    fi
  fi
}

check_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  # BLOCK patterns
  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    echo "$file:$lineno: [BLOCK] DROP TABLE — destroys data irrecoverably"
    BLOCK_COUNT=$((BLOCK_COUNT + 1))
    EXIT_CODE=1
  done < <(grep -niE '\bDROP\s+TABLE\b' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    echo "$file:$lineno: [BLOCK] TRUNCATE — destroys all rows"
    BLOCK_COUNT=$((BLOCK_COUNT + 1))
    EXIT_CODE=1
  done < <(grep -niE '\bTRUNCATE\b' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    if echo "$line" | grep -qiE '\bWHERE\b'; then continue; fi
    # Inside PL/pgSQL functions, DELETE FROM often uses variable-based WHERE on subsequent lines
    # Check if the next few lines contain a WHERE clause
    local context
    context=$(sed -n "$((lineno)),$(( lineno + 3 ))p" "$file" 2>/dev/null || true)
    if echo "$context" | grep -qiE '\bWHERE\b'; then continue; fi
    echo "$file:$lineno: [BLOCK] DELETE FROM without WHERE"
    BLOCK_COUNT=$((BLOCK_COUNT + 1))
    EXIT_CODE=1
  done < <(grep -niE '\bDELETE\s+FROM\b' "$file" 2>/dev/null || true)

  # WARN patterns
  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    # Skip DROP FUNCTION, DROP INDEX, DROP TRIGGER, DROP POLICY — those are INFO level
    if echo "$line" | grep -qiE 'DROP\s+(FUNCTION|INDEX|TRIGGER|POLICY|CONSTRAINT|TYPE)'; then continue; fi
    echo "$file:$lineno: [WARN] DROP COLUMN — potentially destructive"
    WARN_COUNT=$((WARN_COUNT + 1))
  done < <(grep -niE '\bDROP\s+COLUMN\b' "$file" 2>/dev/null || true)

  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    echo "$file:$lineno: [WARN] ALTER TYPE — may lose data"
    WARN_COUNT=$((WARN_COUNT + 1))
  done < <(grep -niE '\bALTER\s+.*\bTYPE\b' "$file" 2>/dev/null | grep -viE 'ADD\s+COLUMN|IF\s+NOT\s+EXISTS|CHECK' || true)

  # INFO patterns
  while IFS=: read -r lineno line; do
    if echo "$line" | grep -qiE '^\s*--'; then continue; fi
    echo "$file:$lineno: [INFO] DROP FUNCTION — usually safe for recreate"
    INFO_COUNT=$((INFO_COUNT + 1))
  done < <(grep -niE '\bDROP\s+FUNCTION\b' "$file" 2>/dev/null || true)
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  check_file "$file"
done < <(get_files)

echo ""
echo "Migration safety: BLOCK=$BLOCK_COUNT WARN=$WARN_COUNT INFO=$INFO_COUNT"
if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "Migration safety: PASS"
else
  echo "Migration safety: FAIL — resolve BLOCK findings before deploying"
fi

exit "$EXIT_CODE"

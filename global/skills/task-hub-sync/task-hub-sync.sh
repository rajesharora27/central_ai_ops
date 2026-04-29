#!/usr/bin/env bash
# Task Hub Sync — validate, archive, and regenerate the Task Hub.
# See SKILL.md for documentation.
set -euo pipefail

TASKS_DIR="${TASKS_DIR:-docs/tasks}"
PLANS_DIR="${PLANS_DIR:-docs/plans}"
COMPLETED_DIR="$TASKS_DIR/completed"
TODO_FILE="docs/TODO.md"

# ── Helpers ──

red()   { printf '\033[0;31m%s\033[0m\n' "$*"; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[0;33m%s\033[0m\n' "$*"; }

get_frontmatter_field() {
  local file="$1" field="$2"
  sed -n '/^---$/,/^---$/p' "$file" 2>/dev/null \
    | grep -m1 "^${field}:" \
    | sed "s/^${field}: *//" \
    | tr -d '"' | tr -d "'"
}

today_date() {
  date +%Y-%m-%d
}

# ── Operations ──

op_validate() {
  local errors=0 warnings=0
  local active_count=0 completed_count=0 plan_count=0

  # Count
  active_count=$(find "$TASKS_DIR" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
  completed_count=$(find "$COMPLETED_DIR" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
  plan_count=$(find "$PLANS_DIR" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l | tr -d ' ')

  echo "Task Hub Validation"
  echo "  Active tasks:  $active_count"
  echo "  Completed:     $completed_count"
  echo "  Plans:         $plan_count"
  echo ""

  for f in "$TASKS_DIR"/*.md; do
    [ -f "$f" ] || continue
    local basename=$(basename "$f")
    local status=$(get_frontmatter_field "$f" "status")
    local id=$(get_frontmatter_field "$f" "id")
    local title=$(get_frontmatter_field "$f" "title")

    # Check: done tasks should not be in active dir
    if [ "$status" = "done" ] || [ "$status" = "completed" ]; then
      red "  ERROR $basename — status '$status' but still in active directory"
      errors=$((errors + 1))
    fi

    # Check: required frontmatter
    if [ -z "$id" ] && [ -z "$title" ]; then
      yellow "  WARN  $basename — missing both 'id' and 'title' in frontmatter"
      warnings=$((warnings + 1))
    fi

    # Check: non-standard status (accept both in_progress and in-progress)
    case "$status" in
      planned|in_progress|in-progress|done|backlog|pending|"") ;;
      completed)
        yellow "  WARN  $basename — status 'completed' should be 'done'"
        warnings=$((warnings + 1))
        ;;
      *)
        yellow "  WARN  $basename — non-standard status '$status'"
        warnings=$((warnings + 1))
        ;;
    esac

    # Check: plan reference exists
    local plan=$(get_frontmatter_field "$f" "plan")
    if [ -n "$plan" ] && [ "$plan" != "null" ] && [ ! -f "$PLANS_DIR/$plan" ]; then
      yellow "  WARN  $basename — plan '$plan' not found in $PLANS_DIR/"
      warnings=$((warnings + 1))
    fi
  done

  echo ""
  if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    green "  No issues found. Task Hub is clean."
  else
    echo "  $errors error(s), $warnings warning(s)"
    [ $errors -gt 0 ] && echo "  Run 'archive' to fix done-task placement."
  fi

  [ $errors -gt 0 ] && return 1
  return 0
}

op_archive() {
  local moved=0

  mkdir -p "$COMPLETED_DIR"

  for f in "$TASKS_DIR"/*.md; do
    [ -f "$f" ] || continue
    local status=$(get_frontmatter_field "$f" "status")

    if [ "$status" = "done" ] || [ "$status" = "completed" ]; then
      # Normalize status: completed → done
      if [ "$status" = "completed" ]; then
        sed -i '' 's/^status: *completed$/status: done/' "$f" 2>/dev/null \
          || sed -i 's/^status: *completed$/status: done/' "$f"
      fi

      mv "$f" "$COMPLETED_DIR/"
      echo "  Archived: $(basename "$f")"
      moved=$((moved + 1))
    fi
  done

  if [ $moved -eq 0 ]; then
    echo "  No done tasks to archive."
  else
    echo ""
    echo "  Archived $moved task(s)."
    op_sync
  fi
}

op_sync() {
  if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
    if grep -q '"tasks:sync"' package.json 2>/dev/null; then
      echo "  Running tasks:sync..."
      npm run tasks:sync --silent 2>&1 | sed 's/^/  /'
      green "  TODO.md regenerated."
      return 0
    fi
  fi

  # Fallback: if no npm script, just warn
  yellow "  No 'tasks:sync' script found in package.json. Regenerate TODO.md manually."
  return 1
}

op_complete() {
  local task_id="$1"
  if [ -z "$task_id" ]; then
    red "  Error: --task-id required for complete operation"
    return 1
  fi

  # Find the task file
  local task_file=""
  for f in "$TASKS_DIR"/*.md; do
    local fid=$(get_frontmatter_field "$f" "id")
    if [ "$fid" = "$task_id" ]; then
      task_file="$f"
      break
    fi
  done

  if [ -z "$task_file" ]; then
    red "  Error: task '$task_id' not found in $TASKS_DIR/"
    return 1
  fi

  # Update status and date
  sed -i '' "s/^status: .*/status: done/" "$task_file" 2>/dev/null \
    || sed -i "s/^status: .*/status: done/" "$task_file"
  sed -i '' "s/^updated: .*/updated: $(today_date)/" "$task_file" 2>/dev/null \
    || sed -i "s/^updated: .*/updated: $(today_date)/" "$task_file"

  echo "  Marked $task_id as done."

  # Archive it
  mkdir -p "$COMPLETED_DIR"
  mv "$task_file" "$COMPLETED_DIR/"
  echo "  Archived to completed/."

  op_sync
}

# ── CLI ──

usage() {
  echo "Usage: task-hub-sync.sh <operation> [options]"
  echo ""
  echo "Operations:"
  echo "  validate              Check task hub integrity"
  echo "  archive               Move done tasks to completed/ and regenerate"
  echo "  sync                  Regenerate docs/TODO.md"
  echo "  complete --task-id ID Mark task done, archive, and regenerate"
  echo ""
  echo "Environment:"
  echo "  TASKS_DIR  (default: docs/tasks)"
  echo "  PLANS_DIR  (default: docs/plans)"
}

OPERATION="${1:-}"
shift 2>/dev/null || true

TASK_ID=""
while [ $# -gt 0 ]; do
  case "$1" in
    --task-id) TASK_ID="$2"; shift 2 ;;
    --tasks-dir) TASKS_DIR="$2"; COMPLETED_DIR="$TASKS_DIR/completed"; shift 2 ;;
    --plans-dir) PLANS_DIR="$2"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

case "$OPERATION" in
  validate) op_validate ;;
  archive)  op_archive ;;
  sync)     op_sync ;;
  complete) op_complete "$TASK_ID" ;;
  "")       usage; exit 1 ;;
  *)        red "Unknown operation: $OPERATION"; usage; exit 1 ;;
esac

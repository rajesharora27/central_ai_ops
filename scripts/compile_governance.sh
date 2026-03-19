#!/usr/bin/env bash
set -euo pipefail

# compile_governance.sh — Compiles the layered governance model into each AI tool's
# entrypoint file so the instructions are delivered as actual content, not path references.
#
# Works on macOS, Linux, and Windows (Git Bash / MSYS2 / WSL).
#
# Usage:
#   scripts/compile_governance.sh [--project PATH ...] [--source PATH] [--dry-run] [--verify]
#
# When run without --project, operates on the current directory.
# When run with --verify, checks that entrypoints exist and contain real content (exit 1 if not).

usage() {
  cat <<'USAGE'
Usage: scripts/compile_governance.sh [OPTIONS]

Compiles governance layers into AI tool entrypoint files.

Options:
  --project, -p PATH   Target project path (repeatable; defaults to cwd)
  --source, -s PATH    Path to central_ai_ops repo (defaults to this script's repo)
  --dry-run            Show what would be written without making changes
  --verify             Verify entrypoints exist and contain content (exit 1 on failure)
  --help, -h           Show this help

Entrypoints generated:
  CLAUDE.md                        (Claude Code)
  AGENTS.md                        (OpenAI Codex)
  .cursorrules                     (Cursor)
  GEMINI.md                        (Gemini)
  .github/copilot-instructions.md  (GitHub Copilot)
USAGE
}

SOURCE_ROOT=""
DRY_RUN=0
VERIFY=0
TARGETS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source|-s)  SOURCE_ROOT="$2"; shift 2 ;;
    --project|-p) TARGETS+=("$2"); shift 2 ;;
    --dry-run)    DRY_RUN=1; shift ;;
    --verify)     VERIFY=1; shift ;;
    --help|-h)    usage; exit 0 ;;
    *)            echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

# Resolve source root
if [[ -z "$SOURCE_ROOT" ]]; then
  SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
if [[ ! -f "$SOURCE_ROOT/global/global-MASTER.md" ]]; then
  echo "ERROR: Missing global-MASTER.md in $SOURCE_ROOT/global/" >&2
  exit 1
fi

# Default target is cwd
if [[ ${#TARGETS[@]} -eq 0 ]]; then
  TARGETS=("$(pwd)")
fi

# ─── Helpers ───

resolve_file() {
  # Try to read a file; handle Windows/Mac path differences
  local path="$1"
  if [[ -f "$path" ]]; then
    cat "$path"
  elif [[ -L "$path" ]]; then
    # Symlink might be a text file containing a path (Windows Git Bash)
    local target
    target="$(cat "$path" 2>/dev/null || readlink "$path" 2>/dev/null || true)"
    if [[ -n "$target" && -f "$target" ]]; then
      cat "$target"
    fi
  fi
}

collect_md_files() {
  # Collect all .md files in a directory (non-recursive), sorted
  local dir="$1"
  if [[ -d "$dir" ]]; then
    find "$dir" -maxdepth 1 -name '*.md' -type f 2>/dev/null | sort
  elif [[ -L "$dir" ]]; then
    # Windows text-file symlink
    local target
    target="$(cat "$dir" 2>/dev/null || true)"
    if [[ -n "$target" && -d "$target" ]]; then
      find "$target" -maxdepth 1 -name '*.md' -type f 2>/dev/null | sort
    fi
  fi
}

resolve_at_refs() {
  # Parse @file references from local-context.md and output their content
  local context_file="$1"
  local repo_root="$2"
  if [[ ! -f "$context_file" ]]; then return; fi

  while IFS= read -r line; do
    # Match lines starting with @
    if [[ "$line" =~ ^@(.+)$ ]]; then
      local ref="${BASH_REMATCH[1]}"
      # Handle glob patterns
      if [[ "$ref" == *"*"* ]]; then
        local pattern_dir
        pattern_dir="$(dirname "$ref")"
        for f in "$repo_root"/$ref; do
          if [[ -f "$f" ]]; then
            echo ""
            cat "$f"
          fi
        done
      elif [[ -f "$repo_root/$ref" ]]; then
        echo ""
        cat "$repo_root/$ref"
      fi
    fi
  done < "$context_file"
}

# ─── Verify mode ───

if [[ "$VERIFY" -eq 1 ]]; then
  FAIL=0
  for PROJECT_PATH in "${TARGETS[@]}"; do
    if [[ ! -d "$PROJECT_PATH" ]]; then
      echo "SKIP (not found): $PROJECT_PATH"
      continue
    fi
    echo "Verifying: $PROJECT_PATH"
    for entry in CLAUDE.md AGENTS.md .cursorrules GEMINI.md .github/copilot-instructions.md; do
      local_file="$PROJECT_PATH/$entry"
      if [[ ! -f "$local_file" ]]; then
        echo "  MISSING: $entry"
        FAIL=1
      else
        line_count="$(wc -l < "$local_file" | tr -d ' ')"
        if [[ "$line_count" -lt 5 ]]; then
          echo "  EMPTY (${line_count} lines): $entry"
          FAIL=1
        else
          echo "  OK (${line_count} lines): $entry"
        fi
      fi
    done
  done
  if [[ "$FAIL" -eq 1 ]]; then
    echo ""
    echo "GOVERNANCE VERIFICATION FAILED. Run: scripts/compile_governance.sh --project <path>"
    exit 1
  fi
  echo ""
  echo "All entrypoints verified."
  exit 0
fi

# ─── Compile mode ───

for PROJECT_PATH in "${TARGETS[@]}"; do
  if [[ ! -d "$PROJECT_PATH" ]]; then
    echo "SKIP (not found): $PROJECT_PATH"
    continue
  fi

  PROJECT_REAL="$(cd "$PROJECT_PATH" && pwd)"
  PROJECT_ID="$(basename "$PROJECT_REAL")"
  echo ""
  echo "Compiling governance for: $PROJECT_REAL"

  # ─── Assemble content ───
  COMPILED=""

  # 1. Global baseline
  COMPILED+="# AI Governance Instructions
"
  COMPILED+="
# currentDate
Today's date is $(date +%Y-%m-%d).
"

  # Global MASTER
  master_content="$(resolve_file "$SOURCE_ROOT/global/global-MASTER.md")"
  if [[ -n "$master_content" ]]; then
    COMPILED+="
$master_content
"
  fi

  # Global rules
  for f in $(collect_md_files "$SOURCE_ROOT/global/rules"); do
    content="$(cat "$f")"
    if [[ -n "$content" ]]; then
      COMPILED+="
$content
"
    fi
  done

  # Global workflows
  for f in $(collect_md_files "$SOURCE_ROOT/global/workflows"); do
    content="$(cat "$f")"
    if [[ -n "$content" ]]; then
      COMPILED+="
$content
"
    fi
  done

  # Global commands
  for f in $(collect_md_files "$SOURCE_ROOT/global/commands"); do
    content="$(cat "$f")"
    if [[ -n "$content" ]]; then
      COMPILED+="
$content
"
    fi
  done

  # 2. Project context — resolve @refs from local-context.md
  local_context="$PROJECT_REAL/.ai_ops/overrides/local-context.md"
  if [[ -f "$local_context" ]]; then
    at_content="$(resolve_at_refs "$local_context" "$PROJECT_REAL")"
    if [[ -n "$at_content" ]]; then
      COMPILED+="$at_content
"
    fi
  fi

  # 3. Project runtime policy (.agent/*/project/)
  for policy_dir in \
    "$PROJECT_REAL/.agent/rules/project" \
    "$PROJECT_REAL/.agent/workflows/project" \
    "$PROJECT_REAL/.agent/commands/project"; do
    if [[ -d "$policy_dir" ]]; then
      for f in "$policy_dir"/*.md; do
        if [[ -f "$f" ]]; then
          content="$(cat "$f")"
          # Skip if already included via @refs
          if [[ -n "$content" ]]; then
            # Check if this file was already pulled in by local-context @refs
            basename_f="$(basename "$f")"
            if echo "$COMPILED" | grep -qF "$basename_f" 2>/dev/null; then
              continue
            fi
            # Use header from filename as dedup check
            first_line="$(head -1 "$f")"
            if echo "$COMPILED" | grep -qF "$first_line" 2>/dev/null; then
              continue
            fi
            COMPILED+="
$content
"
          fi
        fi
      done
    fi
  done

  # Count lines
  LINE_COUNT="$(echo "$COMPILED" | wc -l | tr -d ' ')"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [DRY RUN] Would write $LINE_COUNT lines to each entrypoint"
    echo "  Entrypoints: CLAUDE.md, AGENTS.md, .cursorrules, GEMINI.md, .github/copilot-instructions.md"
    continue
  fi

  # ─── Write entrypoints ───

  # Claude Code
  printf '%s' "$COMPILED" > "$PROJECT_REAL/CLAUDE.md"
  echo "  Wrote CLAUDE.md ($LINE_COUNT lines)"

  # Codex
  printf '%s' "$COMPILED" > "$PROJECT_REAL/AGENTS.md"
  echo "  Wrote AGENTS.md ($LINE_COUNT lines)"

  # Cursor
  printf '%s' "$COMPILED" > "$PROJECT_REAL/.cursorrules"
  echo "  Wrote .cursorrules ($LINE_COUNT lines)"

  # Gemini
  printf '%s' "$COMPILED" > "$PROJECT_REAL/GEMINI.md"
  echo "  Wrote GEMINI.md ($LINE_COUNT lines)"

  # GitHub Copilot
  mkdir -p "$PROJECT_REAL/.github"
  printf '%s' "$COMPILED" > "$PROJECT_REAL/.github/copilot-instructions.md"
  echo "  Wrote .github/copilot-instructions.md ($LINE_COUNT lines)"

  echo "  Done. ($LINE_COUNT lines per entrypoint)"

done

echo ""
echo "Governance compilation complete."

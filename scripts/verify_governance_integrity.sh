#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MASTER="$ROOT/global/global-MASTER.md"
README_FILE="$ROOT/README.md"
ONBOARDING_FILE="$ROOT/ONBOARDING.md"
OPENCODE_FILE="$ROOT/global/global-opencode.md"
CURSOR_FILE="$ROOT/global/cursor/global-cursor-rule.mdc"
BLUEPRINT_FILE="$ROOT/global/workflows/global-application-blueprint.md"

failures=0

require_fixed() {
  local needle="$1"
  local file="$2"
  local message="$3"

  if ! rg -Fq "$needle" "$file"; then
    echo "FAIL: $message" >&2
    failures=1
  fi
}

require_any_fixed() {
  local file="$1"
  local message="$2"
  shift 2

  local matched=0
  local needle
  for needle in "$@"; do
    if rg -Fq "$needle" "$file"; then
      matched=1
      break
    fi
  done

  if [[ "$matched" -ne 1 ]]; then
    echo "FAIL: $message" >&2
    failures=1
  fi
}

require_file() {
  local file="$1"
  local message="$2"

  if [[ ! -f "$file" ]]; then
    echo "FAIL: $message ($file)" >&2
    failures=1
  fi
}

require_file "$MASTER" "missing global master baseline"
require_file "$README_FILE" "missing repository README"
require_file "$ONBOARDING_FILE" "missing onboarding doc"
require_file "$OPENCODE_FILE" "missing OpenCode baseline doc"
require_file "$CURSOR_FILE" "missing Cursor baseline doc"

if [[ "$failures" -eq 0 ]]; then
  require_fixed ".ai_ops/global/rules/global-*.md" "$MASTER" "global-MASTER must load rules via wildcard"
  require_fixed ".ai_ops/global/workflows/global-*.md" "$MASTER" "global-MASTER must load workflows via wildcard"
  require_fixed ".ai_ops/global/commands/*.md" "$MASTER" "global-MASTER must load global commands via wildcard"

  require_fixed ".agent/commands/global/*.md" "$OPENCODE_FILE" "global-opencode must load global command playbooks"
  require_fixed ".agent/commands/project/*.md" "$OPENCODE_FILE" "global-opencode must load project command playbooks"
  require_fixed ".ai_ops/global/workflows/global-*.md" "$CURSOR_FILE" "global cursor baseline must load global workflows via wildcard"
  require_fixed ".ai_ops/global/commands/*.md" "$CURSOR_FILE" "global cursor baseline must load global commands"

  if [[ -f "$BLUEPRINT_FILE" ]]; then
    require_any_fixed "$README_FILE" "README must list the global application blueprint template" \
      ".ai_ops/global/workflows/global-application-blueprint.md" \
      "global/workflows/global-application-blueprint.md"
    require_fixed "global-application-blueprint.md" "$ONBOARDING_FILE" "ONBOARDING must describe blueprint usage"
  fi
fi

if [[ "$failures" -ne 0 ]]; then
  echo "Governance integrity check failed." >&2
  exit 1
fi

echo "Governance integrity checks passed."

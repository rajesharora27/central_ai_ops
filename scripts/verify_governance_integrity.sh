#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MASTER="$ROOT/global/global-MASTER.md"
README_FILE="$ROOT/README.md"
ONBOARDING_FILE="$ROOT/ONBOARDING.md"
AGENTS_FILE="$ROOT/global/global-AGENTS.md"
CLAUDE_FILE="$ROOT/global/global-CLAUDE.md"
OPENCODE_FILE="$ROOT/global/global-opencode.md"
CURSOR_FILE="$ROOT/global/cursor/global-cursor-rule.mdc"
CURSOR_REFERENCE_FILE="$ROOT/global/cursor/global-cursor-reference.md"
CORE_GOVERNANCE_FILE="$ROOT/global/rules/global-core-governance.md"
IMPLEMENTATION_CHECKLIST_FILE="$ROOT/global/workflows/global-implementation-checklist.md"
BLUEPRINT_FILE="$ROOT/global/workflows/global-application-blueprint.md"
LINKER_FILE="$ROOT/scripts/link_ai_governance.sh"
SKILLS_FILE="$ROOT/global/skills/global-skill-authoring-guidelines.md"
CODEX_FILE="$ROOT/global/global-codex.md"

if ! command -v rg >/dev/null 2>&1; then
  echo "FAIL: ripgrep (rg) is required but not installed. Install via: brew install ripgrep" >&2
  exit 1
fi

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

require_symlink_valid() {
  local link_path="$1"
  local message="$2"

  if [[ ! -L "$link_path" ]]; then
    return
  fi
  if [[ ! -e "$link_path" ]]; then
    echo "FAIL: broken symlink: $message ($link_path)" >&2
    failures=1
  fi
}

# --- File existence checks ---
require_file "$MASTER" "missing global master baseline"
require_file "$README_FILE" "missing repository README"
require_file "$ONBOARDING_FILE" "missing onboarding doc"
require_file "$AGENTS_FILE" "missing AGENTS compatibility baseline doc"
require_file "$CLAUDE_FILE" "missing CLAUDE compatibility baseline doc"
require_file "$OPENCODE_FILE" "missing OpenCode baseline doc"
require_file "$CURSOR_FILE" "missing Cursor baseline doc"
require_file "$CURSOR_REFERENCE_FILE" "missing Cursor reference doc"
require_file "$CORE_GOVERNANCE_FILE" "missing global core governance doc"
require_file "$IMPLEMENTATION_CHECKLIST_FILE" "missing implementation checklist doc"
require_file "$LINKER_FILE" "missing governance linker script"
require_file "$SKILLS_FILE" "missing skill authoring guidelines"
require_file "$CODEX_FILE" "missing Codex baseline doc"

# --- Global command files ---
for cmd_file in commit test lint deploy security-audit release; do
  require_file "$ROOT/global/commands/${cmd_file}.md" "missing global command: ${cmd_file}.md"
done

if [[ "$failures" -eq 0 ]]; then
  # --- MASTER content checks ---
  require_fixed ".ai_ops/global/rules/global-*.md" "$MASTER" "global-MASTER must load rules via wildcard"
  require_fixed ".ai_ops/global/workflows/global-*.md" "$MASTER" "global-MASTER must load workflows via wildcard"
  require_fixed ".ai_ops/global/commands/*.md" "$MASTER" "global-MASTER must load global commands via wildcard"
  require_fixed ".ai_ops/global/skills/global-*.md" "$MASTER" "global-MASTER must load skills via wildcard"

  # --- Cross-agent content checks ---
  require_fixed ".agent/commands/global/*.md" "$OPENCODE_FILE" "global-opencode must load global command playbooks"
  require_fixed ".agent/commands/project/*.md" "$OPENCODE_FILE" "global-opencode must load project command playbooks"
  require_fixed ".ai_ops/global/workflows/global-*.md" "$CURSOR_FILE" "global cursor baseline must load global workflows via wildcard"
  require_fixed ".ai_ops/global/commands/*.md" "$CURSOR_FILE" "global cursor baseline must load global commands"

  # --- MASTER bootstrap doc references ---
  require_any_fixed "$MASTER" "global-MASTER must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$MASTER" "global-MASTER must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$MASTER" "global-MASTER must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  # --- Entrypoint compatibility bootstrap doc references ---
  require_any_fixed "$AGENTS_FILE" "global-AGENTS must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$AGENTS_FILE" "global-AGENTS must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$AGENTS_FILE" "global-AGENTS must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$CLAUDE_FILE" "global-CLAUDE must require CONTEXT bootstrap read" "@docs/CONTEXT.md" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$CLAUDE_FILE" "global-CLAUDE must require CONTRIBUTING bootstrap read" "@docs/CONTRIBUTING.md" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$CLAUDE_FILE" "global-CLAUDE must require APPLICATION_BLUEPRINT bootstrap read" "@docs/APPLICATION_BLUEPRINT.md" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$OPENCODE_FILE" "global-opencode must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$OPENCODE_FILE" "global-opencode must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$OPENCODE_FILE" "global-opencode must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$CURSOR_FILE" "global cursor baseline must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$CURSOR_FILE" "global cursor baseline must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$CURSOR_FILE" "global cursor baseline must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$CURSOR_REFERENCE_FILE" "cursor reference must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$CURSOR_REFERENCE_FILE" "cursor reference must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$CURSOR_REFERENCE_FILE" "cursor reference must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$CODEX_FILE" "global-codex must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$CODEX_FILE" "global-codex must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$CODEX_FILE" "global-codex must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$CORE_GOVERNANCE_FILE" "core governance must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$CORE_GOVERNANCE_FILE" "core governance must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$CORE_GOVERNANCE_FILE" "core governance must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  require_any_fixed "$IMPLEMENTATION_CHECKLIST_FILE" "implementation checklist must require CONTEXT bootstrap read" "/docs/CONTEXT.md" "docs/CONTEXT.md"
  require_any_fixed "$IMPLEMENTATION_CHECKLIST_FILE" "implementation checklist must require CONTRIBUTING bootstrap read" "/docs/CONTRIBUTING.md" "docs/CONTRIBUTING.md"
  require_any_fixed "$IMPLEMENTATION_CHECKLIST_FILE" "implementation checklist must require APPLICATION_BLUEPRINT bootstrap read" "/docs/APPLICATION_BLUEPRINT.md" "docs/APPLICATION_BLUEPRINT.md"

  # --- Linker template checks ---
  require_fixed "docs/CONTEXT.md" "$LINKER_FILE" "linker must include docs/CONTEXT.md in generated tool context"
  require_fixed "docs/CONTRIBUTING.md" "$LINKER_FILE" "linker must include docs/CONTRIBUTING.md in generated tool context"
  require_fixed "docs/APPLICATION_BLUEPRINT.md" "$LINKER_FILE" "linker must include docs/APPLICATION_BLUEPRINT.md in generated tool context"

  # --- Linker Codex config checks ---
  require_fixed "codex.instructions.path" "$LINKER_FILE" "linker must include codex.instructions.path in .vscode/settings.json template"
  require_fixed "codex.context.include" "$LINKER_FILE" "linker must include codex.context.include in .vscode/settings.json template"

  # --- Entrypoint wrappers must reference MASTER ---
  require_fixed "global-MASTER.md" "$AGENTS_FILE" "global-AGENTS must reference MASTER"
  require_fixed "global-MASTER.md" "$CLAUDE_FILE" "global-CLAUDE must reference MASTER"

  # --- Blueprint checks ---
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

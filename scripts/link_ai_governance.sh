#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Interrupted." >&2; exit 130' INT TERM

usage() {
  cat <<'USAGE'
Usage: scripts/link_ai_governance.sh [--source PATH] [--project PATH ...] [--project-source PATH] [--force] [--dry-run]

Sets up a layered AI governance model:
- Global baseline from central repo (`.ai_ops/global`)
- Flattened project-local business context (`.ai_ops/overrides/local-context.md`)
- Project runtime rules/workflows/commands/skills (`.agent/*/project`)
- Codex configuration via `.vscode/settings.json` (codex.instructions.path, codex.context.include)
- Context bootstrap docs loaded on startup/refresh when present:
  `docs/CONTEXT.md`, `docs/CONTRIBUTING.md`, `docs/APPLICATION_BLUEPRINT.md`

Options:
  --source, -s   Path to central_ai_ops repo root (defaults to this script's repo)
  --project, -p  Target project repo path (repeatable)
  --env, -e      Backward-compatible alias for --project
  --project-source
                 Optional canonical project repo for project-local overrides.
                 When set, `.ai_ops/overrides` and `.agent/*/project` are linked
                 from this source so local overrides are edited in one place.
  --force        Replace conflicting links/files where safe (does not overwrite project override files)
  --dry-run      Show what would be done without making changes
  --help, -h     Show this help

Examples:
  scripts/link_ai_governance.sh --source ~/dev/central_ai_ops --project ~/dev/dap --force
  scripts/link_ai_governance.sh --project ~/dev/cursor/dap --project-source ~/dev/dap
  scripts/link_ai_governance.sh --project ~/dev/my-app
USAGE
}

SOURCE_ROOT="${AI_OPS_ROOT:-${AI_GOVERNANCE_ROOT:-}}"
PROJECT_SOURCE_ROOT="${AI_PROJECT_SOURCE:-}"
FORCE=0
DRY_RUN=0
TARGETS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source|-s)
      SOURCE_ROOT="$2"
      shift 2
      ;;
    --project|-p|--env|-e)
      TARGETS+=("$2")
      shift 2
      ;;
    --project-source)
      PROJECT_SOURCE_ROOT="$2"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${SOURCE_ROOT}" ]]; then
  SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  TARGETS=("$(pwd)")
fi

SOURCE_ROOT_REAL="$(cd "$SOURCE_ROOT" && pwd)"
if [[ ! -d "$SOURCE_ROOT_REAL/global" ]]; then
  echo "Missing global directory in source root: $SOURCE_ROOT_REAL/global" >&2
  exit 1
fi
if [[ ! -f "$SOURCE_ROOT_REAL/global/global-MASTER.md" ]]; then
  echo "Missing consolidated baseline: $SOURCE_ROOT_REAL/global/global-MASTER.md" >&2
  exit 1
fi
if [[ ! -d "$SOURCE_ROOT_REAL/global/commands" ]]; then
  echo "Missing global commands directory: $SOURCE_ROOT_REAL/global/commands" >&2
  exit 1
fi
if [[ ! -x "$SOURCE_ROOT_REAL/scripts/verify_governance_integrity.sh" ]]; then
  echo "Missing governance integrity verifier: $SOURCE_ROOT_REAL/scripts/verify_governance_integrity.sh" >&2
  exit 1
fi

"$SOURCE_ROOT_REAL/scripts/verify_governance_integrity.sh"

PROJECT_SOURCE_REAL=""
if [[ -n "$PROJECT_SOURCE_ROOT" ]]; then
  if [[ ! -d "$PROJECT_SOURCE_ROOT" ]]; then
    echo "Project source path not found: $PROJECT_SOURCE_ROOT" >&2
    exit 1
  fi
  PROJECT_SOURCE_REAL="$(cd "$PROJECT_SOURCE_ROOT" && pwd)"
fi

TIMESTAMP="$(date +%Y%m%d%H%M%S)"

cleanup_legacy_governance() {
  local env_path="$1"
  [[ -n "$env_path" ]] || return

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[DRY RUN] Would clean legacy governance artifacts in: $env_path"
    return
  fi

  rm -rf "$env_path/.agents" "$env_path/.skillshare"
  rm -rf "$env_path/.agent/commnads" "$env_path/.agent/commands"

  rm -rf \
    "$env_path/.agent.bak."* \
    "$env_path/.cursor.bak."* \
    "$env_path/.cursorrules.bak."* \
    "$env_path/AGENTS.md.bak."* \
    "$env_path/CLAUDE.md.bak."* \
    "$env_path/GEMINI.md.bak."* \
    "$env_path/opencode.json.bak."* \
    "$env_path/.vscode/settings.json.bak."* \
    "$env_path/.ai_ops/global.bak."* \
    "$env_path/scripts/link_ai_governance.sh.bak."* \
    "$env_path/scripts/ensure_governance_links.sh.bak."* \
    "$env_path/scripts/verify_governance_integrity.sh.bak."*

  if [[ -d "$env_path/.cursor" ]]; then
    rm -rf "$env_path/.cursor/"*.bak* 2>/dev/null || true
  fi

  for path in \
    "$env_path/.agent" \
    "$env_path/.agent/commands" \
    "$env_path/.cursor" \
    "$env_path/.cursorrules" \
    "$env_path/AGENTS.md" \
    "$env_path/CLAUDE.md" \
    "$env_path/GEMINI.md" \
    "$env_path/opencode.json" \
    "$env_path/.vscode/settings.json"; do
    if [[ -L "$path" ]]; then
      rm "$path"
    fi
  done
}

link_path() {
  local target="$1"
  local source="$2"

  if [[ -L "$target" ]]; then
    local current
    current="$(readlink "$target")"
    if [[ "$current" == "$source" ]]; then
      echo "OK linked: $target -> $source"
      return
    fi
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[DRY RUN] Would link: $target -> $source"
    return
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    if [[ "$FORCE" -eq 1 ]]; then
      rm -rf "$target"
    else
      mv "$target" "${target}.bak.${TIMESTAMP}"
      echo "Backed up: $target -> ${target}.bak.${TIMESTAMP}"
    fi
  fi

  mkdir -p "$(dirname "$target")"
  ln -s "$source" "$target"
  echo "Linked: $target -> $source"
}

write_if_missing() {
  local file_path="$1"
  local content="$2"

  if [[ -e "$file_path" ]]; then
    return
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[DRY RUN] Would create: $file_path"
    return
  fi

  mkdir -p "$(dirname "$file_path")"
  printf '%s\n' "$content" > "$file_path"
  echo "Created: $file_path"
}

ensure_local_context_file() {
  local repo_root="$1"
  local project_id="$2"
  local local_context="$repo_root/.ai_ops/overrides/local-context.md"
  local legacy_dir="$repo_root/.ai_ops/project/$project_id"
  local legacy_agents="$legacy_dir/${project_id}-AGENTS.md"
  local legacy_claude="$legacy_dir/${project_id}-CLAUDE.md"
  local legacy_cursor="$legacy_dir/${project_id}-cursor.md"
  local legacy_opencode="$legacy_dir/${project_id}-opencode.md"

  if [[ -e "$local_context" ]]; then
    return
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[DRY RUN] Would create: $local_context"
    return
  fi

  if [[ -d "$legacy_dir" ]] && ([[ -f "$legacy_agents" ]] || [[ -f "$legacy_claude" ]] || [[ -f "$legacy_cursor" ]] || [[ -f "$legacy_opencode" ]]); then
    mkdir -p "$(dirname "$local_context")"
    {
      echo "# Local Context"
      echo
      echo "Migrated project context for \`$project_id\`."
      echo "This file is loaded after \`.ai_ops/global/global-MASTER.md\` and takes precedence on conflict."
      echo
      for legacy_file in "$legacy_agents" "$legacy_claude" "$legacy_cursor" "$legacy_opencode"; do
        if [[ -f "$legacy_file" ]]; then
          echo "## Source: $(basename "$legacy_file")"
          echo
          cat "$legacy_file"
          echo
        fi
      done
      echo "## Runtime Project Policy"
      echo
      echo "@.agent/rules/project/${project_id}-project-rules.md"
      echo "@.agent/workflows/project/${project_id}-project-workflow.md"
      echo "@.agent/commands/project/*.md"
    } > "$local_context"
    echo "Migrated: $local_context (from $legacy_dir)"
    return
  fi

  mkdir -p "$(dirname "$local_context")"
  cat > "$local_context" <<EOF_CONTEXT
# Local Context

Add project-specific business logic, constraints, and references here.
This file is loaded after \`.ai_ops/global/global-MASTER.md\` and overrides it on conflict.

## Runtime Project Policy
@.agent/rules/project/${project_id}-project-rules.md
@.agent/workflows/project/${project_id}-project-workflow.md
@.agent/commands/project/*.md
EOF_CONTEXT
  echo "Created: $local_context"
}

ensure_project_override_scaffold() {
  local repo_root="$1"
  local project_id="$2"
  local project_cursor_mdc="$repo_root/.cursor/rules/${project_id}-cursor-overrides.mdc"

  mkdir -p \
    "$repo_root/.ai_ops/overrides" \
    "$repo_root/.agent/rules/project" \
    "$repo_root/.agent/workflows/project" \
    "$repo_root/.agent/commands/project" \
    "$repo_root/.agent/skills/project" \
    "$repo_root/.cursor/rules"

  ensure_local_context_file "$repo_root" "$project_id"

  if [[ -f "$repo_root/.cursor/rules/project-overrides.mdc" && ! -f "$project_cursor_mdc" ]]; then
    mv "$repo_root/.cursor/rules/project-overrides.mdc" "$project_cursor_mdc"
    echo "Renamed: $repo_root/.cursor/rules/project-overrides.mdc -> $repo_root/.cursor/rules/${project_id}-cursor-overrides.mdc"
  fi

  write_if_missing "$project_cursor_mdc" "---
description: ${project_id} project overrides
globs: **/*
---
# ${project_id} Project Overrides
- Apply @.ai_ops/overrides/local-context.md after global rules.
- If conflict exists, local context takes precedence."

  write_if_missing "$repo_root/.agent/rules/project/${project_id}-project-rules.md" "# ${project_id} Project Rules

Add project-specific rule logic here.
These rules override global rules on conflict."

  write_if_missing "$repo_root/.agent/workflows/project/${project_id}-project-workflow.md" "# ${project_id} Project Workflow

Add project-specific workflow steps here."
}

link_master_entrypoints() {
  local repo_root="$1"
  local master_file="$repo_root/.ai_ops/global/global-MASTER.md"

  for entry_file in AGENTS.md CLAUDE.md .cursorrules GEMINI.md; do
    link_path "$repo_root/$entry_file" "$master_file"
  done
}

for ENV_PATH in "${TARGETS[@]}"; do
  if [[ ! -d "$ENV_PATH" ]]; then
    echo "Skip (not found): $ENV_PATH"
    continue
  fi

  ENV_REAL="$(cd "$ENV_PATH" && pwd)"
  PROJECT_ID="$(basename "$ENV_REAL")"
  PROJECT_SOURCE_FOR_TARGET=""
  USE_PROJECT_SOURCE_LINKS=0

  if [[ -n "$PROJECT_SOURCE_REAL" ]]; then
    PROJECT_ID="$(basename "$PROJECT_SOURCE_REAL")"
    PROJECT_SOURCE_FOR_TARGET="$PROJECT_SOURCE_REAL"
    if [[ "$ENV_REAL" != "$PROJECT_SOURCE_FOR_TARGET" ]]; then
      USE_PROJECT_SOURCE_LINKS=1
    fi
  fi

  PROJECT_OVERRIDES_DIR="$ENV_REAL/.ai_ops/overrides"
  PROJECT_CURSOR_MDC="$ENV_REAL/.cursor/rules/${PROJECT_ID}-cursor-overrides.mdc"

  if [[ "$ENV_REAL" == "$SOURCE_ROOT_REAL" ]]; then
    echo "Skip source repo: $ENV_PATH"
    continue
  fi

  echo
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[DRY RUN] Configuring layered AI ops in: $ENV_REAL"
  else
    echo "Configuring layered AI ops in: $ENV_REAL"
  fi

  cleanup_legacy_governance "$ENV_REAL"

  if [[ "$DRY_RUN" -eq 0 ]]; then
    mkdir -p \
      "$ENV_REAL/.ai_ops" \
      "$ENV_REAL/.agent/rules" \
      "$ENV_REAL/.agent/workflows" \
      "$ENV_REAL/.agent/commands" \
      "$ENV_REAL/.agent/skills" \
      "$ENV_REAL/.cursor/rules" \
      "$ENV_REAL/.vscode" \
      "$ENV_REAL/scripts"
  fi

  link_path "$ENV_REAL/.ai_ops/global" "$SOURCE_ROOT_REAL/global"
  link_path "$ENV_REAL/.agent/rules/global" "$SOURCE_ROOT_REAL/global/rules"
  link_path "$ENV_REAL/.agent/workflows/global" "$SOURCE_ROOT_REAL/global/workflows"
  link_path "$ENV_REAL/.agent/commands/global" "$SOURCE_ROOT_REAL/global/commands"
  link_path "$ENV_REAL/.agent/skills/global" "$SOURCE_ROOT_REAL/global/skills"
  link_path "$ENV_REAL/.cursor/rules/global-cursor-rule.mdc" "$SOURCE_ROOT_REAL/global/cursor/global-cursor-rule.mdc"
  link_path "$ENV_REAL/scripts/link_ai_governance.sh" "$SOURCE_ROOT_REAL/scripts/link_ai_governance.sh"
  link_path "$ENV_REAL/scripts/ensure_governance_links.sh" "$SOURCE_ROOT_REAL/scripts/ensure_governance_links.sh"

  link_master_entrypoints "$ENV_REAL"

  write_if_missing "$ENV_REAL/opencode.json" "{
  \"instructions\": [
    \".ai_ops/global/global-MASTER.md\",
    \".ai_ops/overrides/local-context.md\",
    \"docs/CONTEXT.md\",
    \"docs/CONTRIBUTING.md\",
    \"docs/APPLICATION_BLUEPRINT.md\",
    \".agent/rules/global/*.md\",
    \".agent/rules/project/*.md\",
    \".agent/workflows/global/*.md\",
    \".agent/workflows/project/*.md\",
    \".agent/commands/global/*.md\",
    \".agent/commands/project/*.md\",
    \".agent/skills/global/**/SKILL.md\",
    \".agent/skills/project/**/SKILL.md\"
  ]
}"

  write_if_missing "$ENV_REAL/.vscode/settings.json" "{
  \"codex.instructions.path\": \"AGENTS.md\",
  \"codex.context.include\": [
    \".ai_ops/global/global-MASTER.md\",
    \".ai_ops/overrides/local-context.md\",
    \"docs/CONTEXT.md\",
    \"docs/CONTRIBUTING.md\",
    \"docs/APPLICATION_BLUEPRINT.md\",
    \".agent/rules/global\",
    \".agent/rules/project\",
    \".agent/commands/global\",
    \".agent/commands/project\"
  ],
  \"files.exclude\": {
    \"**/node_modules\": true,
    \"**/.git\": true
  }
}"

  if [[ "$USE_PROJECT_SOURCE_LINKS" -eq 1 ]]; then
    ensure_project_override_scaffold "$PROJECT_SOURCE_FOR_TARGET" "$PROJECT_ID"

    link_path "$PROJECT_OVERRIDES_DIR" "$PROJECT_SOURCE_FOR_TARGET/.ai_ops/overrides"
    link_path "$ENV_REAL/.agent/rules/project" "$PROJECT_SOURCE_FOR_TARGET/.agent/rules/project"
    link_path "$ENV_REAL/.agent/workflows/project" "$PROJECT_SOURCE_FOR_TARGET/.agent/workflows/project"
    link_path "$ENV_REAL/.agent/commands/project" "$PROJECT_SOURCE_FOR_TARGET/.agent/commands/project"
    link_path "$ENV_REAL/.agent/skills/project" "$PROJECT_SOURCE_FOR_TARGET/.agent/skills/project"
    link_path "$PROJECT_CURSOR_MDC" "$PROJECT_SOURCE_FOR_TARGET/.cursor/rules/${PROJECT_ID}-cursor-overrides.mdc"

    echo "Project overrides linked from canonical source: $PROJECT_SOURCE_FOR_TARGET"
  else
    ensure_project_override_scaffold "$ENV_REAL" "$PROJECT_ID"
  fi

done

echo
echo "Layered AI ops linking complete."

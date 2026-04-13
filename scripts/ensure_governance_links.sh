#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Interrupted." >&2; exit 130' INT TERM

usage() {
  cat <<'USAGE'
Usage: scripts/ensure_governance_links.sh [OPTIONS]

Safely ensure governance is present for an existing project repo.

Default behavior:
- Creates missing governance files and links.
- Leaves existing files unchanged.
- Removes nothing unless you explicitly pass --force.

Options:
  --source, -s PATH    Path to central_ai_ops repo root
  --project, -p PATH   Target project repo path (repeatable; defaults to current repo)
  --env, -e PATH       Backward-compatible alias for --project
  --project-source     Optional canonical project repo for project-local overrides
  --dry-run            Show what would change without writing
  --verbose            Print detailed operation output
  --quiet              Minimize output
  --force              Replace conflicting governance paths and remove obsolete governance scripts
  --missing-only       Create only missing files and links (default)
  --help, -h           Show this help

Examples:
  bash scripts/ensure_governance_links.sh
  bash scripts/ensure_governance_links.sh --dry-run
  bash scripts/ensure_governance_links.sh --force
  bash scripts/ensure_governance_links.sh --project ../my-app --source ../central_ai_ops
USAGE
}

SCRIPT_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SELF_ROOT="$(cd "$SCRIPT_HOME/.." && pwd)"

SOURCE_ROOT_INPUT=""
PROJECT_SOURCE_INPUT="${AI_PROJECT_SOURCE:-${AI_GOVERNANCE_PROJECT_SOURCE:-}}"
QUIET="${AI_OPS_QUIET:-${AI_GOVERNANCE_QUIET:-0}}"
FORCE="${AI_OPS_FORCE:-${AI_GOVERNANCE_FORCE:-0}}"
MISSING_ONLY="${AI_OPS_MISSING_ONLY:-${AI_GOVERNANCE_MISSING_ONLY:-1}}"
SHOW_ALIAS_HINT="${AI_OPS_SHOW_ALIAS_HINT:-1}"
VERBOSE="${AI_OPS_VERBOSE:-0}"
DRY_RUN=0
TARGETS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source|-s)
      SOURCE_ROOT_INPUT="$2"
      shift 2
      ;;
    --project|-p|--env|-e)
      TARGETS+=("$2")
      shift 2
      ;;
    --project-source)
      PROJECT_SOURCE_INPUT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    --quiet)
      QUIET=1
      shift
      ;;
    --force)
      FORCE=1
      MISSING_ONLY=0
      shift
      ;;
    --missing-only)
      MISSING_ONLY=1
      FORCE=0
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

log() {
  if [[ "$QUIET" != "1" ]]; then
    echo "$@"
  fi
}

warn() {
  if [[ "$QUIET" != "1" ]]; then
    echo "$@" >&2
  fi
}

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  TARGETS=("$(cd "$SCRIPT_HOME/.." && pwd)")
fi

resolve_source_root() {
  local repo_root="$1"
  local configured=""

  if [[ -n "$SOURCE_ROOT_INPUT" ]]; then
    configured="$SOURCE_ROOT_INPUT"
  elif git -C "$repo_root" config --get ai.opsRoot >/dev/null 2>&1; then
    configured="$(git -C "$repo_root" config --get ai.opsRoot)"
  elif git -C "$repo_root" config --get ai.governanceRoot >/dev/null 2>&1; then
    configured="$(git -C "$repo_root" config --get ai.governanceRoot)"
  elif [[ -n "${AI_OPS_ROOT:-}" ]]; then
    configured="${AI_OPS_ROOT}"
  elif [[ -n "${AI_GOVERNANCE_ROOT:-}" ]]; then
    configured="${AI_GOVERNANCE_ROOT}"
  elif [[ -f "$SELF_ROOT/global/global-MASTER.md" ]]; then
    configured="$SELF_ROOT"
  elif [[ -d "$repo_root/../central_ai_ops" ]]; then
    configured="$repo_root/../central_ai_ops"
  fi

  if [[ -z "$configured" ]]; then
    echo "Unable to locate central_ai_ops. Set ai.opsRoot/ai.governanceRoot or pass --source." >&2
    exit 1
  fi

  if [[ ! -d "$configured" ]]; then
    echo "Configured central_ai_ops path not found: $configured" >&2
    exit 1
  fi

  (cd "$configured" && pwd)
}

resolve_project_source_root() {
  local repo_root="$1"
  local configured="$PROJECT_SOURCE_INPUT"

  if [[ -z "$configured" ]] && git -C "$repo_root" config --get ai.projectSource >/dev/null 2>&1; then
    configured="$(git -C "$repo_root" config --get ai.projectSource)"
  elif [[ -z "$configured" ]] && git -C "$repo_root" config --get ai.governanceProjectSource >/dev/null 2>&1; then
    configured="$(git -C "$repo_root" config --get ai.governanceProjectSource)"
  fi

  if [[ -z "$configured" ]]; then
    return
  fi

  if [[ -d "$configured" ]]; then
    (cd "$configured" && pwd)
  elif [[ -d "$repo_root/$configured" ]]; then
    (cd "$repo_root/$configured" && pwd)
  else
    echo "Project source path not found: $configured" >&2
    exit 1
  fi
}

SOURCE_ROOT_REAL="$(resolve_source_root "$(cd "${TARGETS[0]}" && pwd)")"

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

TIMESTAMP="$(date +%Y%m%d%H%M%S)"

print_clean_sync_output() {
  local repo_root="$1"
  local project_source="$2"

  if [[ "$QUIET" == "1" ]]; then
    return
  fi

  if [[ "$MISSING_ONLY" == "1" ]]; then
    echo "ai-sync: governance ensured (existing files left unchanged)"
  else
    echo "ai-sync: governance refreshed"
  fi
  echo "repo: $repo_root"
  echo "source: $SOURCE_ROOT_REAL"
  if [[ -n "$project_source" ]]; then
    echo "project-source: $project_source"
  fi
}

print_alias_hint() {
  if [[ "$QUIET" == "1" || "$SHOW_ALIAS_HINT" != "1" ]]; then
    return
  fi

  echo "hint: add this alias to ~/.bashrc"
  echo "alias ai-sync='bash scripts/ensure_governance_links.sh'"
}

cleanup_legacy_governance() {
  local repo_root="$1"
  [[ -n "$repo_root" ]] || return

  if [[ "$MISSING_ONLY" -eq 1 ]]; then
    return
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would clean legacy governance artifacts in: $repo_root"
    return
  fi

  rm -rf "$repo_root/.agents" "$repo_root/.skillshare"
  rm -rf "$repo_root/.agent/commnads"

  rm -rf \
    "$repo_root/.agent.bak."* \
    "$repo_root/.cursor.bak."* \
    "$repo_root/.cursorrules.bak."* \
    "$repo_root/AGENTS.md.bak."* \
    "$repo_root/CLAUDE.md.bak."* \
    "$repo_root/GEMINI.md.bak."* \
    "$repo_root/opencode.json.bak."* \
    "$repo_root/.vscode/settings.json.bak."* \
    "$repo_root/.github/copilot-instructions.md.bak."* \
    "$repo_root/.ai_ops/global.bak."* \
    "$repo_root/scripts/bootstrap_link.sh.bak."* \
    "$repo_root/scripts/compile_governance.sh.bak."* \
    "$repo_root/scripts/ensure_governance_links.sh.bak."* \
    "$repo_root/scripts/link_ai_governance.sh.bak."* \
    "$repo_root/scripts/verify_governance_integrity.sh.bak."*

  if [[ -d "$repo_root/.cursor" ]]; then
    rm -rf "$repo_root/.cursor/"*.bak* 2>/dev/null || true
  fi

  for path in \
    "$repo_root/.agent" \
    "$repo_root/.agent/commands" \
    "$repo_root/.cursor" \
    "$repo_root/.cursorrules" \
    "$repo_root/AGENTS.md" \
    "$repo_root/CLAUDE.md" \
    "$repo_root/GEMINI.md" \
    "$repo_root/.github/copilot-instructions.md" \
    "$repo_root/opencode.json" \
    "$repo_root/.vscode/settings.json"; do
    if [[ -L "$path" ]]; then
      rm "$path"
    fi
  done
}

remove_obsolete_governance_script() {
  local target="$1"

  if [[ "$MISSING_ONLY" -eq 1 ]]; then
    return
  fi
  if [[ ! -e "$target" && ! -L "$target" ]]; then
    return
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would remove obsolete governance script: $target"
    return
  fi

  rm -rf "$target"
  log "Removed obsolete: $target"
}

link_path() {
  local target="$1"
  local source="$2"

  if [[ -L "$target" ]]; then
    local current
    current="$(readlink "$target")"
    if [[ "$current" == "$source" ]]; then
      log "OK linked: $target -> $source"
      return
    fi
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    if [[ "$MISSING_ONLY" -eq 1 ]]; then
      log "Skip existing: $target"
      return
    fi
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would link: $target -> $source"
    return
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    if [[ "$FORCE" -eq 1 ]]; then
      rm -rf "$target"
    else
      mv "$target" "${target}.bak.${TIMESTAMP}"
      log "Backed up: $target -> ${target}.bak.${TIMESTAMP}"
    fi
  fi

  mkdir -p "$(dirname "$target")"
  ln -s "$source" "$target"
  log "Linked: $target -> $source"
}

write_if_missing() {
  local file_path="$1"
  local content="$2"

  if [[ -e "$file_path" ]]; then
    return
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would create: $file_path"
    return
  fi

  mkdir -p "$(dirname "$file_path")"
  printf '%s\n' "$content" > "$file_path"
  log "Created: $file_path"
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
    log "[DRY RUN] Would create: $local_context"
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
      echo "## Canonical Project Documents"
      echo
      echo "@docs/CONTEXT.md"
      echo "@docs/CONTRIBUTING.md"
      echo "@docs/APPLICATION_BLUEPRINT.md"
      echo "@docs/${project_id}.md"
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
    log "Migrated: $local_context (from $legacy_dir)"
    return
  fi

  mkdir -p "$(dirname "$local_context")"
  cat > "$local_context" <<EOF_CONTEXT
# Local Context

Add project-specific business logic, constraints, and references here.
This file is loaded after \`.ai_ops/global/global-MASTER.md\` and overrides it on conflict.

## Canonical Project Documents
@docs/CONTEXT.md
@docs/CONTRIBUTING.md
@docs/APPLICATION_BLUEPRINT.md
@docs/${project_id}.md

## Runtime Project Policy
@.agent/rules/project/${project_id}-project-rules.md
@.agent/workflows/project/${project_id}-project-workflow.md
@.agent/commands/project/*.md
EOF_CONTEXT
  log "Created: $local_context"
}

ensure_project_override_scaffold() {
  local repo_root="$1"
  local project_id="$2"
  local project_cursor_mdc="$repo_root/.cursor/rules/${project_id}-cursor-overrides.mdc"
  local legacy_cursor_override="$repo_root/.cursor/rules/project-overrides.mdc"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would ensure project override scaffold under: $repo_root"
  else
    mkdir -p \
      "$repo_root/.ai_ops/overrides" \
      "$repo_root/.agent/rules/project" \
      "$repo_root/.agent/workflows/project" \
      "$repo_root/.agent/commands/project" \
      "$repo_root/.agent/skills/project" \
      "$repo_root/.cursor/rules"
  fi

  ensure_local_context_file "$repo_root" "$project_id"

  if [[ -f "$legacy_cursor_override" && ! -f "$project_cursor_mdc" ]]; then
    if [[ "$MISSING_ONLY" -eq 1 ]]; then
      log "Skip existing legacy cursor override: $legacy_cursor_override"
    elif [[ "$DRY_RUN" -eq 1 ]]; then
      log "[DRY RUN] Would rename: $legacy_cursor_override -> $project_cursor_mdc"
    else
      mv "$legacy_cursor_override" "$project_cursor_mdc"
      log "Renamed: $legacy_cursor_override -> $project_cursor_mdc"
    fi
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

  for entry_file in AGENTS.md CLAUDE.md .cursorrules GEMINI.md .github/copilot-instructions.md; do
    link_path "$repo_root/$entry_file" "$master_file"
  done
}

for ENV_PATH in "${TARGETS[@]}"; do
  if [[ ! -d "$ENV_PATH" ]]; then
    warn "Skip (not found): $ENV_PATH"
    continue
  fi

  ENV_REAL="$(cd "$ENV_PATH" && pwd)"
  PROJECT_SOURCE_REAL="$(resolve_project_source_root "$ENV_REAL" || true)"
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
    warn "Skip source repo: $ENV_PATH"
    continue
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log ""
    log "[DRY RUN] Ensuring governance in: $ENV_REAL"
  else
    log ""
    log "Ensuring governance in: $ENV_REAL"
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
  link_path "$ENV_REAL/scripts/ensure_governance_links.sh" "$SOURCE_ROOT_REAL/scripts/ensure_governance_links.sh"

  remove_obsolete_governance_script "$ENV_REAL/scripts/link_ai_governance.sh"
  remove_obsolete_governance_script "$ENV_REAL/scripts/compile_governance.sh"

  link_master_entrypoints "$ENV_REAL"

  write_if_missing "$ENV_REAL/opencode.json" "{
  \"instructions\": [
    \".ai_ops/global/global-MASTER.md\",
    \".ai_ops/overrides/local-context.md\",
    \"docs/CONTEXT.md\",
    \"docs/CONTRIBUTING.md\",
    \"docs/APPLICATION_BLUEPRINT.md\",
    \"docs/${PROJECT_ID}.md\",
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
    \"docs/${PROJECT_ID}.md\",
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

    log "Project overrides linked from canonical source: $PROJECT_SOURCE_FOR_TARGET"
  else
    ensure_project_override_scaffold "$ENV_REAL" "$PROJECT_ID"
  fi

  print_clean_sync_output "$ENV_REAL" "$PROJECT_SOURCE_FOR_TARGET"
done

print_alias_hint

#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Interrupted." >&2; exit 130' INT TERM

usage() {
  cat <<'USAGE'
Usage: scripts/bootstrap_link.sh [--project-source PATH] [--dry-run] /path/to/project/repo [more repos...]

Bootstraps layered AI ops for each project repo:
- sets ai.opsRoot and ai.governanceRoot git config keys
- optionally sets ai.projectSource for cross-clone project override sync
- installs auto-sync git hooks (.githooks/post-checkout|post-merge|post-rewrite)
- links global baseline from central_ai_ops
- links AGENTS.md / CLAUDE.md / .cursorrules / GEMINI.md to `.ai_ops/global/global-MASTER.md`
- seeds tool context include paths with docs bootstrap files:
  `docs/CONTEXT.md`, `docs/CONTRIBUTING.md`, `docs/APPLICATION_BLUEPRINT.md`
- scaffolds `.ai_ops/overrides/local-context.md`, or links overrides from project-source
- links global command packs and scaffolds project command packs
USAGE
}

PROJECT_SOURCE_INPUT="${AI_PROJECT_SOURCE:-}"
DRY_RUN=0
TARGETS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-source)
      PROJECT_SOURCE_INPUT="$2"
      shift 2
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
      TARGETS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#TARGETS[@]} -lt 1 ]]; then
  usage
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LINKER="$ROOT/scripts/link_ai_governance.sh"
PROJECT_SOURCE_REAL=""

if [[ -n "$PROJECT_SOURCE_INPUT" ]]; then
  if [[ ! -d "$PROJECT_SOURCE_INPUT" ]]; then
    echo "Project source path not found: $PROJECT_SOURCE_INPUT" >&2
    exit 1
  fi
  PROJECT_SOURCE_REAL="$(cd "$PROJECT_SOURCE_INPUT" && pwd)"
fi

if [[ ! -x "$LINKER" ]]; then
  echo "Missing linker: $LINKER" >&2
  exit 1
fi
if [[ ! -f "$ROOT/global/global-MASTER.md" ]]; then
  echo "Missing consolidated baseline: $ROOT/global/global-MASTER.md" >&2
  exit 1
fi
if [[ ! -d "$ROOT/global/commands" ]]; then
  echo "Missing global commands directory: $ROOT/global/commands" >&2
  exit 1
fi
if [[ ! -x "$ROOT/scripts/verify_governance_integrity.sh" ]]; then
  echo "Missing governance integrity verifier: $ROOT/scripts/verify_governance_integrity.sh" >&2
  exit 1
fi

install_hook() {
  local target_repo="$1"
  local hook_name="$2"
  local hook_path="$target_repo/.githooks/$hook_name"

  mkdir -p "$target_repo/.githooks"
  cat <<'HOOK' > "$hook_path"
#!/usr/bin/env bash
set -euo pipefail
if [[ -x scripts/ensure_governance_links.sh ]]; then
  AI_OPS_QUIET=1 AI_OPS_FORCE=1 bash scripts/ensure_governance_links.sh || true
fi
HOOK
  chmod +x "$hook_path"
}

enforce_master_entrypoints() {
  local target_repo="$1"
  local timestamp
  local master_file="$target_repo/.ai_ops/global/global-MASTER.md"
  timestamp="$(date +%Y%m%d%H%M%S)"

  if [[ ! -f "$master_file" ]]; then
    echo "Warning: missing master baseline file: $master_file" >&2
    return
  fi

  for entry in AGENTS.md CLAUDE.md .cursorrules GEMINI.md; do
    local target_path="$target_repo/$entry"
    local current_target=""

    if [[ -L "$target_path" ]]; then
      current_target="$(readlink "$target_path")"
      if [[ "$current_target" == "$master_file" ]]; then
        echo "OK linked: $target_path -> $master_file"
        continue
      fi
    fi

    if [[ -e "$target_path" || -L "$target_path" ]]; then
      mv "$target_path" "${target_path}.bak.${timestamp}"
      echo "Backed up: $target_path -> ${target_path}.bak.${timestamp}"
    fi

    ln -s "$master_file" "$target_path"
    echo "Linked: $target_path -> $master_file"
  done
}

for TARGET in "${TARGETS[@]}"; do
  if [[ ! -d "$TARGET" ]]; then
    echo "Skip (not found): $TARGET" >&2
    continue
  fi

  TARGET_REAL="$(cd "$TARGET" && pwd)"
  echo
  echo "Bootstrapping layered AI ops: $TARGET_REAL"

  if git -C "$TARGET_REAL" rev-parse --git-dir >/dev/null 2>&1; then
    if [[ "$DRY_RUN" -eq 1 ]]; then
      echo "[DRY RUN] Would set git config ai.opsRoot=$ROOT"
      echo "[DRY RUN] Would set git config ai.governanceRoot=$ROOT"
      if [[ -n "$PROJECT_SOURCE_REAL" ]]; then
        echo "[DRY RUN] Would set git config ai.projectSource=$PROJECT_SOURCE_REAL"
      fi
      echo "[DRY RUN] Would install git hooks: post-checkout, post-merge, post-rewrite"
      echo "[DRY RUN] Would set git config core.hooksPath=.githooks"
    else
      git -C "$TARGET_REAL" config ai.opsRoot "$ROOT"
      git -C "$TARGET_REAL" config ai.governanceRoot "$ROOT"
      if [[ -n "$PROJECT_SOURCE_REAL" ]]; then
        git -C "$TARGET_REAL" config ai.projectSource "$PROJECT_SOURCE_REAL"
      fi

      install_hook "$TARGET_REAL" post-checkout
      install_hook "$TARGET_REAL" post-merge
      install_hook "$TARGET_REAL" post-rewrite

      git -C "$TARGET_REAL" config core.hooksPath .githooks
    fi
  else
    echo "Warning: $TARGET_REAL is not a git repo (skipping git config)"
  fi

  LINK_ARGS=(--source "$ROOT" --project "$TARGET_REAL" --force)
  if [[ -n "$PROJECT_SOURCE_REAL" ]]; then
    LINK_ARGS+=(--project-source "$PROJECT_SOURCE_REAL")
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    LINK_ARGS+=(--dry-run)
  fi

  "$LINKER" "${LINK_ARGS[@]}"
  if [[ "$DRY_RUN" -eq 0 ]]; then
    enforce_master_entrypoints "$TARGET_REAL"
  fi
done

echo
echo "Bootstrap complete."

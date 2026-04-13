#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Interrupted." >&2; exit 130' INT TERM

usage() {
  cat <<'USAGE'
Usage: scripts/bootstrap_link.sh [--project-source PATH] [--dry-run] /path/to/project/repo [more repos...]

Bootstrap governance for a new project repo.

This script is the first-time setup path:
- sets ai.opsRoot and ai.governanceRoot git config keys
- optionally sets ai.projectSource for cross-clone project override sync
- installs safe auto-sync git hooks (.githooks/post-checkout|post-merge|post-rewrite)
- enforces the governance baseline by running ensure_governance_links.sh in force mode

Use scripts/ensure_governance_links.sh afterward for safe anytime syncs.
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
ENSURE_SCRIPT="$ROOT/scripts/ensure_governance_links.sh"
PROJECT_SOURCE_REAL=""

if [[ -n "$PROJECT_SOURCE_INPUT" ]]; then
  if [[ ! -d "$PROJECT_SOURCE_INPUT" ]]; then
    echo "Project source path not found: $PROJECT_SOURCE_INPUT" >&2
    exit 1
  fi
  PROJECT_SOURCE_REAL="$(cd "$PROJECT_SOURCE_INPUT" && pwd)"
fi

if [[ ! -x "$ENSURE_SCRIPT" ]]; then
  echo "Missing governance ensure script: $ENSURE_SCRIPT" >&2
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
  AI_OPS_QUIET=1 AI_OPS_MISSING_ONLY=1 bash scripts/ensure_governance_links.sh || true
fi
HOOK
  chmod +x "$hook_path"
}

for TARGET in "${TARGETS[@]}"; do
  if [[ ! -d "$TARGET" ]]; then
    echo "Skip (not found): $TARGET" >&2
    continue
  fi

  TARGET_REAL="$(cd "$TARGET" && pwd)"
  echo
  echo "Bootstrapping governance in: $TARGET_REAL"

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

  ENSURE_ARGS=(--source "$ROOT" --project "$TARGET_REAL" --force)
  if [[ -n "$PROJECT_SOURCE_REAL" ]]; then
    ENSURE_ARGS+=(--project-source "$PROJECT_SOURCE_REAL")
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    ENSURE_ARGS+=(--dry-run)
  fi

  bash "$ENSURE_SCRIPT" "${ENSURE_ARGS[@]}"
done

echo
echo "Bootstrap complete."

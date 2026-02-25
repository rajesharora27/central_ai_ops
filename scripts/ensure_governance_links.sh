#!/usr/bin/env bash
set -euo pipefail

QUIET="${AI_OPS_QUIET:-${AI_GOVERNANCE_QUIET:-0}}"
FORCE="${AI_OPS_FORCE:-${AI_GOVERNANCE_FORCE:-1}}"
SHOW_ALIAS_HINT="${AI_OPS_SHOW_ALIAS_HINT:-1}"
VERBOSE="${AI_OPS_VERBOSE:-0}"

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

print_clean_sync_output() {
  if [[ "$QUIET" == "1" ]]; then
    return
  fi

  echo "ai-sync: governance links refreshed"
  echo "repo: $REPO_ROOT"
  echo "source: $ROOT"
  if [[ -n "$PROJECT_SOURCE" ]]; then
    echo "project-source: $PROJECT_SOURCE"
  fi
}

print_alias_hint() {
  if [[ "$QUIET" == "1" || "$SHOW_ALIAS_HINT" != "1" ]]; then
    return
  fi

  echo "hint: add this alias to ~/.bashrc"
  echo "alias ai-sync='bash scripts/ensure_governance_links.sh'"
}

ROOT=""
if git config --get ai.opsRoot >/dev/null 2>&1; then
  ROOT="$(git config --get ai.opsRoot)"
elif git config --get ai.governanceRoot >/dev/null 2>&1; then
  ROOT="$(git config --get ai.governanceRoot)"
fi

PROJECT_SOURCE=""
if git config --get ai.projectSource >/dev/null 2>&1; then
  PROJECT_SOURCE="$(git config --get ai.projectSource)"
elif git config --get ai.governanceProjectSource >/dev/null 2>&1; then
  PROJECT_SOURCE="$(git config --get ai.governanceProjectSource)"
fi

if [[ -z "$ROOT" && -n "${AI_OPS_ROOT:-}" ]]; then
  ROOT="$AI_OPS_ROOT"
elif [[ -z "$ROOT" && -n "${AI_GOVERNANCE_ROOT:-}" ]]; then
  ROOT="$AI_GOVERNANCE_ROOT"
fi

if [[ -z "$PROJECT_SOURCE" && -n "${AI_PROJECT_SOURCE:-}" ]]; then
  PROJECT_SOURCE="$AI_PROJECT_SOURCE"
elif [[ -z "$PROJECT_SOURCE" && -n "${AI_GOVERNANCE_PROJECT_SOURCE:-}" ]]; then
  PROJECT_SOURCE="$AI_GOVERNANCE_PROJECT_SOURCE"
fi

if [[ -z "$ROOT" ]]; then
  warn "ai-ops: set AI_OPS_ROOT (or AI_GOVERNANCE_ROOT) or git config ai.opsRoot to enable auto-linking."
  exit 0
fi

if [[ ! -d "$ROOT" ]]; then
  warn "ai-ops: governance root not found: $ROOT"
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -n "$PROJECT_SOURCE" ]]; then
  if [[ -d "$PROJECT_SOURCE" ]]; then
    PROJECT_SOURCE="$(cd "$PROJECT_SOURCE" && pwd)"
  elif [[ -d "$REPO_ROOT/$PROJECT_SOURCE" ]]; then
    PROJECT_SOURCE="$(cd "$REPO_ROOT/$PROJECT_SOURCE" && pwd)"
  else
    warn "ai-ops: project source not found, ignoring: $PROJECT_SOURCE"
    PROJECT_SOURCE=""
  fi
fi

if [[ ! -x "$REPO_ROOT/scripts/link_ai_governance.sh" ]]; then
  warn "ai-ops: link script not found: $REPO_ROOT/scripts/link_ai_governance.sh"
  exit 0
fi

LINK_ARGS=(--source "$ROOT" --project "$REPO_ROOT")
if [[ "$VERBOSE" == "1" ]]; then
  log "ai-ops: linking from $ROOT into $REPO_ROOT"
fi
if [[ "$FORCE" == "1" ]]; then
  LINK_ARGS+=(--force)
fi
if [[ -n "$PROJECT_SOURCE" ]]; then
  LINK_ARGS+=(--project-source "$PROJECT_SOURCE")
  if [[ "$VERBOSE" == "1" ]]; then
    log "ai-ops: project overrides source $PROJECT_SOURCE"
  fi
fi

run_output="$(mktemp)"
trap 'rm -f "$run_output"' EXIT
if "$REPO_ROOT/scripts/link_ai_governance.sh" "${LINK_ARGS[@]}" >"$run_output" 2>&1; then
  print_clean_sync_output
  if [[ "$VERBOSE" == "1" && "$QUIET" != "1" ]]; then
    cat "$run_output"
  fi
  print_alias_hint
else
  warn "ai-sync: failed to refresh governance links"
  if [[ "$QUIET" != "1" ]]; then
    cat "$run_output" >&2
  fi
  exit 1
fi

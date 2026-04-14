#!/usr/bin/env bash
set -euo pipefail

# Secret Scan — portable, no project-specific assumptions.
# Detects hardcoded secrets in tracked or staged files.

SCAN_PATH="."
STAGED=0
EXCLUDE_PATTERN=""
EXIT_CODE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staged)   STAGED=1; shift ;;
    --path)     SCAN_PATH="$2"; shift 2 ;;
    --exclude)  EXCLUDE_PATTERN="$2"; shift 2 ;;
    *)          shift ;;
  esac
done

get_files() {
  if [[ "$STAGED" -eq 1 ]]; then
    git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true
  else
    git ls-files "$SCAN_PATH" 2>/dev/null || find "$SCAN_PATH" -type f 2>/dev/null
  fi
}

should_skip() {
  local file="$1"
  # Skip binary files, lock files, and common non-secret files
  case "$file" in
    *.lock|*.png|*.jpg|*.jpeg|*.gif|*.ico|*.woff*|*.ttf|*.eot|*.svg|*.mp4|*.pdf) return 0 ;;
    *.env.example|*.env.template) return 0 ;;
    *.sops.json|*.sops.yaml|*.sops.env) return 0 ;; # SOPS-encrypted files are safe
    node_modules/*|.git/*|dist/*|ios/build/*|android/build/*) return 0 ;;
    .claude/*|.cursor/*) return 0 ;; # Tool config files
    docs/plans/*) return 0 ;; # Plan docs may reference key patterns in examples
    *secret-scan.sh|*SKILL.md) return 0 ;; # Don't scan self
  esac
  if [[ -n "$EXCLUDE_PATTERN" ]] && echo "$file" | grep -qE "$EXCLUDE_PATTERN"; then
    return 0
  fi
  return 1
}

check_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  # .env files being committed (except examples)
  if echo "$file" | grep -qE '\.env(\..+)?$' && ! echo "$file" | grep -qE '\.env\.(example|template)$'; then
    echo "$file:1: [BLOCK] .env file staged — remove from git tracking"
    EXIT_CODE=1
    return
  fi

  # Private key content (skip string-literal checks like .includes('-----BEGIN'))
  while IFS=: read -r lineno line; do
    # Skip lines that are checking for the pattern or using it in tooling commands
    if echo "$line" | grep -qE "(includes|indexOf|startsWith|match|test|===|==|\.contains)\(.*-----BEGIN"; then continue; fi
    if echo "$line" | grep -qE "(sed|grep|awk|openssl|echo).*-----BEGIN"; then continue; fi
    if echo "$line" | grep -qE '^\s*(//|/?\*|#)'; then continue; fi
    echo "$file:$lineno: [BLOCK] Private key content detected"
    EXIT_CODE=1
  done < <(grep -n -- '-----BEGIN' "$file" 2>/dev/null || true)

  # OpenAI/Stripe secret keys (sk- followed by 20+ alphanumeric)
  while IFS=: read -r lineno _; do
    echo "$file:$lineno: [BLOCK] Possible API secret key (sk-...)"
    EXIT_CODE=1
  done < <(grep -nE 'sk-[a-zA-Z0-9]{20,}' "$file" 2>/dev/null || true)

  # Stripe live/test keys
  while IFS=: read -r lineno _; do
    echo "$file:$lineno: [BLOCK] Stripe key detected"
    EXIT_CODE=1
  done < <(grep -nE 'sk_(live|test)_[a-zA-Z0-9]{20,}' "$file" 2>/dev/null || true)

  # AWS access keys
  while IFS=: read -r lineno _; do
    echo "$file:$lineno: [BLOCK] AWS access key detected"
    EXIT_CODE=1
  done < <(grep -nE 'AKIA[A-Z0-9]{16}' "$file" 2>/dev/null || true)

  # Very long base64 tokens (likely JWTs or service keys) — only in non-config files
  if ! echo "$file" | grep -qE '(eas\.json|package\.json|\.config\.)'; then
    while IFS=: read -r lineno _; do
      echo "$file:$lineno: [BLOCK] Long JWT/token detected — use environment variable"
      EXIT_CODE=1
    done < <(grep -nE 'eyJ[a-zA-Z0-9_-]{80,}' "$file" 2>/dev/null || true)
  fi
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if should_skip "$file"; then continue; fi
  check_file "$file"
done < <(get_files)

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "Secret scan: PASS"
else
  echo ""
  echo "Secret scan: FAIL — remove secrets before committing"
fi

exit "$EXIT_CODE"

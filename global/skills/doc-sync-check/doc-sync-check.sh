#!/usr/bin/env bash
set -euo pipefail

# Documentation Sync Validator — generic, project supplies trigger config.

TRIGGERS_PATH=".ai_ops/overrides/doc-sync-triggers.json"
STAGED=0
DIFF_BASE=""
CI_MODE=0
WARN_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --triggers)    TRIGGERS_PATH="$2"; shift 2 ;;
    --staged)      STAGED=1; shift ;;
    --diff)        DIFF_BASE="$2"; shift 2 ;;
    --ci)          CI_MODE=1; shift ;;
    --warn-only)   CI_MODE=0; shift ;;
    *)             shift ;;
  esac
done

if [[ ! -f "$TRIGGERS_PATH" ]]; then
  echo "Doc sync: no trigger config at $TRIGGERS_PATH — skipping"
  exit 0
fi

# Get changed files
if [[ "$STAGED" -eq 1 ]]; then
  CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
elif [[ -n "$DIFF_BASE" ]]; then
  CHANGED_FILES=$(git diff --name-only "$DIFF_BASE"...HEAD 2>/dev/null || true)
else
  CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || true)
fi

if [[ -z "$CHANGED_FILES" ]]; then
  echo "Doc sync: no changed files — PASS"
  exit 0
fi

# Parse triggers and check
# Requires node for JSON parsing (available in any Node.js project)
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$TRIGGERS_PATH', 'utf8'));
const changed = \`$CHANGED_FILES\`.split('\n').filter(Boolean);

let warnings = 0;
for (const trigger of config.triggers || []) {
  const pattern = new RegExp(trigger.pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
  const matched = changed.some(f => pattern.test(f));
  if (!matched) continue;

  for (const doc of trigger.docs || []) {
    if (!changed.includes(doc)) {
      console.log('[WARN] ' + (trigger.label || trigger.pattern) + ': changed files match ' + trigger.pattern + ' but ' + doc + ' not updated');
      warnings++;
    }
  }
}

if (warnings === 0) {
  console.log('Doc sync: PASS');
} else {
  console.log('');
  console.log('Doc sync: ' + warnings + ' warning(s) — consider updating the listed docs');
  if ($CI_MODE === 1) process.exit(1);
}
" 2>&1

exit 0

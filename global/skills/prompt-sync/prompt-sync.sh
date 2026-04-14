#!/usr/bin/env bash
set -euo pipefail

# Prompt Sync Validator — checks that condensed and readable system prompts stay aligned.
# Requires node (available in any Node.js project).

CONDENSED="config/system-instructions.md"
READABLE="config/system-instructions-readable.md"
TERMS_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --condensed) CONDENSED="$2"; shift 2 ;;
    --readable)  READABLE="$2"; shift 2 ;;
    --terms)     TERMS_FILE="$2"; shift 2 ;;
    *)           shift ;;
  esac
done

if [[ ! -f "$CONDENSED" ]]; then
  echo "Prompt sync: condensed file not found at $CONDENSED — skipping"
  exit 0
fi
if [[ ! -f "$READABLE" ]]; then
  echo "Prompt sync: readable file not found at $READABLE — skipping"
  exit 0
fi

PROMPT_SYNC_SCRIPT=$(cat <<'NODESCRIPT'
const fs = require('fs');
const condensed = fs.readFileSync(process.env.PS_CONDENSED, 'utf8');
const readable = fs.readFileSync(process.env.PS_READABLE, 'utf8');

const getHeaders = (text) => [...text.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim().toUpperCase());
const getWords = (h) => h.replace(/[^A-Z0-9 ]/g, '').trim().split(/\s+/).filter(w => w.length > 2);

function headersMatch(a, b) {
  const aWords = new Set(getWords(a));
  return getWords(b).some(w => aWords.has(w));
}

const condensedHeaders = getHeaders(condensed);
const readableHeaders = getHeaders(readable);

let issues = 0;
for (const h of readableHeaders) {
  if (!condensedHeaders.some(ch => headersMatch(h, ch))) {
    console.log('[WARN] Section "' + h + '" in READABLE but no match in CONDENSED');
    issues++;
  }
}
for (const h of condensedHeaders) {
  if (!readableHeaders.some(rh => headersMatch(h, rh))) {
    console.log('[WARN] Section "' + h + '" in CONDENSED but no match in READABLE');
    issues++;
  }
}

let terms = ['EMERGENCY_FLAG', 'HARD_VETO_FLAG', 'CAUTION_FLAG'];
const termsFile = process.env.PS_TERMS || '';
if (termsFile && fs.existsSync(termsFile)) {
  try { terms = [...terms, ...(JSON.parse(fs.readFileSync(termsFile, 'utf8')).terms || [])]; } catch {}
}

for (const term of terms) {
  const inC = condensed.toLowerCase().includes(term.toLowerCase());
  const inR = readable.toLowerCase().includes(term.toLowerCase());
  if (inR && !inC) { console.log('[WARN] Key term "' + term + '" in READABLE but missing from CONDENSED'); issues++; }
  if (inC && !inR) { console.log('[WARN] Key term "' + term + '" in CONDENSED but missing from READABLE'); issues++; }
}

const cSize = Buffer.byteLength(condensed, 'utf8');
const rSize = Buffer.byteLength(readable, 'utf8');
console.log('Condensed: ' + cSize + ' bytes | Readable: ' + rSize + ' bytes | Savings: ' + Math.round((1 - cSize / rSize) * 100) + '%');

if (issues === 0) { console.log('Prompt sync: PASS'); }
else { console.log('Prompt sync: FAIL — ' + issues + ' issue(s)'); process.exit(1); }
NODESCRIPT
)

PS_CONDENSED="$CONDENSED" PS_READABLE="$READABLE" PS_TERMS="$TERMS_FILE" node -e "$PROMPT_SYNC_SCRIPT"

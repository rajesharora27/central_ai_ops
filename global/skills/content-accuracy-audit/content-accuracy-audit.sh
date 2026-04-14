#!/usr/bin/env bash
set -euo pipefail

# Content Accuracy Audit — portable wrapper.
# Invokes the project's audit backend (edge function or local script).

SCOPE="user"
USER_ID=""
USER_IDS=""
COUNT=5
DAYS=1
SAMPLE=10
OUTPUT="summary"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)   SCOPE="$2"; shift 2 ;;
    --id)      USER_ID="$2"; shift 2 ;;
    --ids)     USER_IDS="$2"; shift 2 ;;
    --count)   COUNT="$2"; shift 2 ;;
    --days)    DAYS="$2"; shift 2 ;;
    --sample)  SAMPLE="$2"; shift 2 ;;
    --output)  OUTPUT="$2"; shift 2 ;;
    *)         shift ;;
  esac
done

# Validate inputs
case "$SCOPE" in
  user)
    if [[ -z "$USER_ID" ]]; then
      echo "Error: --id <user-id> is required when --scope user" >&2
      exit 1
    fi
    ;;
  users)
    if [[ -z "$USER_IDS" ]]; then
      echo "Error: --ids <id1,id2,...> is required when --scope users" >&2
      exit 1
    fi
    ;;
  random|all) ;;
  *)
    echo "Error: --scope must be user, users, random, or all" >&2
    exit 1
    ;;
esac

# Build payload
PAYLOAD="{\"scope\":\"$SCOPE\",\"days\":$DAYS,\"sample\":$SAMPLE,\"count\":$COUNT,\"output\":\"$OUTPUT\""
if [[ -n "$USER_ID" ]]; then
  PAYLOAD="$PAYLOAD,\"userId\":\"$USER_ID\""
fi
if [[ -n "$USER_IDS" ]]; then
  # Convert comma-separated to JSON array
  IDS_JSON=$(echo "$USER_IDS" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' | sed 's/^/[/' | sed 's/$/]/')
  PAYLOAD="$PAYLOAD,\"userIds\":$IDS_JSON"
fi
PAYLOAD="$PAYLOAD}"

# Try edge function first (production/staging), fall back to local callBackend
if [[ -f "deploy/env.prod" ]]; then
  # Source env for Supabase URL and service role key
  set -a
  # shellcheck disable=SC1091
  source deploy/env.prod 2>/dev/null || true
  set +a
fi

SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL:-}"
SERVICE_KEY="${PROD_SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-}}"

if [[ -n "$SUPABASE_URL" && -n "$SERVICE_KEY" ]]; then
  RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/functions/v1/app-api" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"action\":\"audit.content_accuracy\",\"payload\":$PAYLOAD}")

  if [[ "$OUTPUT" == "json" ]]; then
    echo "$RESPONSE"
  else
    echo "$RESPONSE" | node -e "
      const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      if (data.error) { console.error('Error:', data.error); process.exit(1); }
      const r = data.data;
      console.log('Content Accuracy Audit');
      console.log('Period:', r.period?.start, '—', r.period?.end);
      console.log('Users audited:', r.users_audited ?? 1);
      console.log('Overall accuracy:', ((r.overall_accuracy ?? r.accuracy_score ?? 0) * 100).toFixed(1) + '%');
      if (r.findings?.length) {
        console.log('');
        console.log('Findings:');
        for (const f of r.findings) {
          console.log('  [' + f.severity.toUpperCase() + '] ' + f.type + ': ' + f.message_excerpt.slice(0,80));
          console.log('    Expected: ' + f.expected);
        }
      }
      if (r.prompt_suggestions?.length) {
        console.log('');
        console.log('Prompt suggestions:');
        for (const s of r.prompt_suggestions) {
          console.log('  [' + s.confidence + '] ' + s.suggestion);
        }
      }
      if ((r.overall_accuracy ?? r.accuracy_score ?? 1) < 0.9) {
        console.log('');
        console.log('BELOW 90% — review findings above');
      } else {
        console.log('');
        console.log('PASS');
      }
    " 2>&1
  fi
else
  echo "Error: Cannot reach Vigo backend. Set EXPO_PUBLIC_SUPABASE_URL and service role key, or source deploy/env.prod." >&2
  exit 1
fi

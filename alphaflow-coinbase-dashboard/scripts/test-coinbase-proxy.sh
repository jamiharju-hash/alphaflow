#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?Set SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?Set SUPABASE_ANON_KEY}"

curl -sS "$SUPABASE_URL/functions/v1/coinbase-proxy" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","endpoint":"/api/v3/brokerage/accounts"}' | jq .

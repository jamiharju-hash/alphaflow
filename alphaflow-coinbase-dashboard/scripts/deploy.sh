#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env.local" ]; then
  echo "Missing .env.local. Copy .env.example and fill values first."
  exit 1
fi

supabase db push
supabase secrets set --env-file .env.local
supabase functions deploy coinbase-proxy

echo "Done."

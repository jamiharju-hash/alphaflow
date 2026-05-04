# AlphaFlow

AlphaFlow is a portfolio intelligence dashboard for tracking Coinbase Advanced Trade accounts, portfolio exposure, opportunities, scoring, due diligence, and weekly reviews.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase SSR client
- Coinbase Advanced Trade API server proxy
- JWT signing on the server only

## Core modules

- Dashboard overview
- Coinbase account sync endpoint
- Positions and exposure
- Opportunity scoring engine
- Due diligence checklist
- Weekly KPI review
- Supabase schema and RLS-ready database tables

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

COINBASE_API_BASE="https://api.coinbase.com"
COINBASE_KEY_ID="YOUR_COINBASE_KEY_ID"
COINBASE_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
COINBASE_PRIVATE_KEY_BASE64="OPTIONAL_BASE64_PKCS8_DER"
```

Do not expose Coinbase secrets with `NEXT_PUBLIC_`.

## Database

Run the SQL migration in Supabase SQL editor or via Supabase CLI:

```bash
supabase db push
```

## Coinbase proxy

The server endpoint is:

```text
POST /api/coinbase
```

It only allowlists safe read endpoints by default. Trading endpoints are intentionally excluded until manual approvals, risk limits, max exposure and stop-loss rules are implemented.

## Build

```bash
npm run build
```

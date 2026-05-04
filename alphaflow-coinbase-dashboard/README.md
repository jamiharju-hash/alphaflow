# AlphaFlow Coinbase Dashboard

Next.js + Supabase + Coinbase Advanced Trade API -dashboard.

## Sisältö

- Next.js dashboard
- Supabase Edge Function `coinbase-proxy`
- Coinbase Advanced Trade API -proxy JWT-signauksella
- Portfolio / account / product / order -näkymät
- SQL migration perustauluille
- Secrets-ready rakenne

## 1. Asennus

```bash
npm install
cp .env.example .env.local
```

Täytä `.env.local`.

## 2. Supabase

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase secrets set --env-file .env.local
supabase functions deploy coinbase-proxy
```

Supabase Edge Functions lukee secretit `Deno.env.get(...)`-kutsulla.

## 3. Käynnistys

```bash
npm run dev
```

Avaa:

```text
http://localhost:3000
```

## 4. Coinbase-auth

Function käyttää seuraavia env-muuttujia:

```env
COINBASE_API_BASE="https://api.coinbase.com"
COINBASE_KEY_ID="..."
COINBASE_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

Vaihtoehtoisesti:

```env
COINBASE_PRIVATE_KEY_BASE64="..."
```

## 5. Endpointit

Sallitut reitit proxyn läpi:

- `GET /api/v3/brokerage/accounts`
- `GET /api/v3/brokerage/products`
- `GET /api/v3/brokerage/products/{product_id}`
- `GET /api/v3/brokerage/orders/historical/batch`
- `GET /api/v3/brokerage/portfolios`
- `GET /api/v3/brokerage/transaction_summary`

Tämä on tarkoituksella allowlistattu, jotta dashboard ei muutu avoimeksi API-proxyksi.

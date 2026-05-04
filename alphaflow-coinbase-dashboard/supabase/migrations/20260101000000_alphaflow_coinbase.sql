create extension if not exists "pgcrypto";

create table if not exists public.coinbase_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text not null default 'started',
  message text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.coinbase_accounts (
  id uuid primary key default gen_random_uuid(),
  coinbase_uuid text unique,
  name text,
  currency text,
  available_value numeric(28,10),
  hold_value numeric(28,10),
  raw jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.coinbase_products (
  id uuid primary key default gen_random_uuid(),
  product_id text unique not null,
  base_name text,
  quote_name text,
  price numeric(28,10),
  price_change_24h numeric(18,8),
  volume_24h numeric(28,10),
  status text,
  raw jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.coinbase_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  product_id text,
  side text,
  status text,
  created_time timestamptz,
  raw jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'coinbase',
  total_value_eur numeric(28,10),
  cash_eur numeric(28,10),
  holdings_value_eur numeric(28,10),
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.coinbase_sync_logs enable row level security;
alter table public.coinbase_accounts enable row level security;
alter table public.coinbase_products enable row level security;
alter table public.coinbase_orders enable row level security;
alter table public.portfolio_snapshots enable row level security;

create policy "authenticated read coinbase_sync_logs"
on public.coinbase_sync_logs for select
to authenticated
using (true);

create policy "authenticated read coinbase_accounts"
on public.coinbase_accounts for select
to authenticated
using (true);

create policy "authenticated read coinbase_products"
on public.coinbase_products for select
to authenticated
using (true);

create policy "authenticated read coinbase_orders"
on public.coinbase_orders for select
to authenticated
using (true);

create policy "authenticated read portfolio_snapshots"
on public.portfolio_snapshots for select
to authenticated
using (true);

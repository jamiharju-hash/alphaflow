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

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_currency text not null default 'EUR',
  starting_capital numeric(14,2) not null default 10000,
  current_cash numeric(14,2) not null default 10000,
  max_saas_exposure_pct numeric(5,2) not null default 40,
  max_crypto_token_exposure_pct numeric(5,2) not null default 10,
  hard_stop_loss_pct numeric(5,2) not null default 20,
  min_cash_buffer_pct numeric(5,2) not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  name text not null,
  ticker text,
  category text not null,
  source_url text,
  thesis text,
  risk_notes text,
  capital_required numeric(14,2),
  expected_upside_multiple numeric(8,2),
  expected_return_days int,
  asymmetry_score int not null default 0 check (asymmetry_score between 0 and 30),
  velocity_score int not null default 0 check (velocity_score between 0 and 30),
  owner_edge_score int not null default 0 check (owner_edge_score between 0 and 20),
  liquidity_score int not null default 0 check (liquidity_score between 0 and 20),
  total_score int generated always as (asymmetry_score + velocity_score + owner_edge_score + liquidity_score) stored,
  decision text generated always as (
    case
      when asymmetry_score + velocity_score + owner_edge_score + liquidity_score >= 80 then 'EXECUTE_REVIEW'
      when asymmetry_score + velocity_score + owner_edge_score + liquidity_score >= 60 then 'WATCHLIST'
      else 'IGNORE'
    end
  ) stored,
  status text not null default 'new',
  scanner_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  opportunity_id uuid references public.investment_opportunities(id),
  asset_name text not null,
  ticker text,
  category text not null,
  entry_amount numeric(14,2) not null,
  current_value numeric(14,2),
  entry_date date not null default current_date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.due_diligence_reviews (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.investment_opportunities(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  red_flags text,
  final_notes text,
  approved boolean,
  approved_capital numeric(14,2),
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  review_week date not null,
  portfolio_value numeric(14,2),
  cash_available numeric(14,2),
  realized_pnl numeric(14,2),
  unrealized_pnl numeric(14,2),
  win_rate numeric(5,2),
  capital_velocity_days numeric(8,2),
  key_wins text,
  key_losses text,
  next_actions text,
  created_at timestamptz not null default now(),
  unique(portfolio_id, review_week)
);

create or replace view public.portfolio_summary as
select
  p.id as portfolio_id,
  p.name,
  p.starting_capital,
  p.current_cash,
  coalesce(sum(case when pp.status = 'active' then pp.current_value else 0 end), 0) as active_value,
  p.current_cash + coalesce(sum(case when pp.status = 'active' then pp.current_value else 0 end), 0) as total_portfolio_value,
  count(pp.id) filter (where pp.status = 'active') as active_positions_count
from public.portfolios p
left join public.portfolio_positions pp on pp.portfolio_id = p.id
group by p.id;

alter table public.coinbase_sync_logs enable row level security;
alter table public.coinbase_accounts enable row level security;
alter table public.coinbase_products enable row level security;
alter table public.coinbase_orders enable row level security;
alter table public.portfolios enable row level security;
alter table public.investment_opportunities enable row level security;
alter table public.portfolio_positions enable row level security;
alter table public.due_diligence_reviews enable row level security;
alter table public.weekly_reviews enable row level security;

create policy "authenticated read coinbase logs" on public.coinbase_sync_logs for select to authenticated using (true);
create policy "authenticated read coinbase accounts" on public.coinbase_accounts for select to authenticated using (true);
create policy "authenticated read coinbase products" on public.coinbase_products for select to authenticated using (true);
create policy "authenticated read coinbase orders" on public.coinbase_orders for select to authenticated using (true);
create policy "authenticated read portfolios" on public.portfolios for select to authenticated using (true);
create policy "authenticated read opportunities" on public.investment_opportunities for select to authenticated using (true);
create policy "authenticated read positions" on public.portfolio_positions for select to authenticated using (true);
create policy "authenticated read dd" on public.due_diligence_reviews for select to authenticated using (true);
create policy "authenticated read weekly" on public.weekly_reviews for select to authenticated using (true);

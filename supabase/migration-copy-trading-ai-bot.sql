-- ============================================================================
-- Copy trading + AI bot — run once in the Supabase SQL Editor.
-- Admin-managed catalog. A user's own copies and bot settings are kept
-- client-side, so no per-user tables are required.
-- ============================================================================

-- Traders available to copy (managed in /admin/trading)
create table if not exists public.copy_traders (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  handle          text default '',
  strategy        text default '',
  risk            text default 'Medium' check (risk in ('Low', 'Medium', 'High')),
  monthly_return  numeric default 0,
  win_rate        numeric default 0,
  followers       integer default 0,
  spark           jsonb default '[]'::jsonb,
  is_active       boolean default true,
  featured        boolean default false,
  created_at      timestamptz default now()
);

-- Single-row global AI-bot configuration (id is always 1)
create table if not exists public.ai_bot_config (
  id                integer primary key default 1,
  platform_enabled  boolean default true,
  min_allocation    numeric default 100,
  daily_return_min  numeric default 0.4,
  daily_return_max  numeric default 1.8,
  win_rate          numeric default 87
);

insert into public.ai_bot_config (id) values (1) on conflict (id) do nothing;

-- Seed a few traders so the catalog isn't empty on first run.
insert into public.copy_traders (name, handle, strategy, risk, monthly_return, win_rate, followers, spark, featured) values
  ('Nova Quant',    '@novaquant',    'Momentum · Crypto majors',    'High',   14.2, 78, 8421,  '[50,56,54,60,58,66,68,66,74,72,80,84]', true),
  ('Atlas Capital', '@atlascap',     'Macro swing · Indices + FX',  'Medium', 8.6,  84, 15230, '[52,54,53,57,60,59,63,66,65,70,72,76]', true),
  ('Sage Income',   '@sageincome',   'Low-vol dividend + bonds',    'Low',    3.4,  91, 22190, '[50,51,52,53,54,55,56,57,58,59,60,61]', false),
  ('Orion Futures', '@orionfut',     'Trend-following · Commodities','High',  11.8, 72, 5140,  '[48,52,50,58,55,64,60,70,66,76,72,82]', false)
on conflict do nothing;

-- Catalog + config are public, read-only to anyone; writes go through the
-- service-role admin API only (RLS left disabled, matching payment_config).

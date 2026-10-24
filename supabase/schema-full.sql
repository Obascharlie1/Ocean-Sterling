-- ============================================================================
-- Ocean Sterling — complete database schema
-- Run this whole file in the Supabase SQL Editor (SQL Editor → New query).
-- Safe to re-run: everything uses IF NOT EXISTS / OR REPLACE / ON CONFLICT.
-- ============================================================================

-- ─── 1. PROFILES ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  full_name                   text default '',
  email                       text default '',
  gender                      text default '',
  date_of_birth               date,
  phone                       text default '',
  country                     text default '',
  state                       text default '',
  address                     text default '',
  plan                        text default 'None',
  balance                     numeric(15,2) default 0,
  profit                      numeric(15,2) default 0,
  kyc_status                  text default 'None' check (kyc_status in ('None','Pending','Verified')),
  kyc_doc_type                text,
  kyc_submitted_at            timestamptz,
  kyc_front_url               text,
  kyc_back_url                text,
  is_suspended                boolean default false,
  suspension_message          text,
  language                    text default 'en',
  -- Per-user withdrawal authorization (admin-managed)
  withdrawal_otp              text,
  withdrawal_otp_active       boolean default false,
  withdrawal_otp_expires_at   timestamptz,
  withdrawal_pin_instructions text,
  withdrawal_pin_result       text,
  created_at                  timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


-- ─── 2. TRANSACTIONS ─────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('Deposit','Withdrawal')),
  amount     numeric(15,2) not null check (amount > 0),
  method     text not null,
  status     text default 'Pending' check (status in ('Pending','Completed','Rejected')),
  note       text,
  receipt_url text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users read own transactions" on public.transactions;
create policy "Users read own transactions" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Users create own transactions" on public.transactions;
create policy "Users create own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);


-- ─── 3. NOTIFICATIONS ────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  type       text default 'info' check (type in ('info','success','warning','error')),
  read       boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ─── 4. PAYMENT CONFIG (singleton row, id = 1) ───────────────────────────────
-- Deposit destinations shown to users. Managed by admin via the service role.
create table if not exists public.payment_config (
  id                  integer primary key default 1,
  btc_address         text default '',
  bank_name           text default '',
  bank_account_name   text default '',
  bank_account_number text default '',
  bank_sort_code      text default '',
  bank_swift          text default '',
  paypal_email        text default ''
);
insert into public.payment_config (id) values (1) on conflict (id) do nothing;
alter table public.payment_config enable row level security; -- service-role only


-- ─── 5. COPY-TRADING TRADERS ─────────────────────────────────────────────────
create table if not exists public.copy_traders (
  id             uuid default gen_random_uuid() primary key,
  name           text not null,
  handle         text default '',
  strategy       text default '',
  risk           text default 'Medium' check (risk in ('Low','Medium','High')),
  monthly_return numeric default 0,
  win_rate       numeric default 0,
  followers      integer default 0,
  spark          jsonb default '[]'::jsonb,
  is_active      boolean default true,
  featured       boolean default false,
  created_at     timestamptz default now()
);
alter table public.copy_traders enable row level security; -- read/write via service role


-- ─── 6. AI BOT CONFIG (singleton row, id = 1) ────────────────────────────────
create table if not exists public.ai_bot_config (
  id               integer primary key default 1,
  platform_enabled boolean default true,
  min_allocation   numeric default 100,
  daily_return_min numeric default 0.4,
  daily_return_max numeric default 1.8,
  win_rate         numeric default 87
);
insert into public.ai_bot_config (id) values (1) on conflict (id) do nothing;
alter table public.ai_bot_config enable row level security; -- service-role only


-- ─── 7. AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 8. STORAGE BUCKETS (private; accessed via service role) ──────────────────
insert into storage.buckets (id, name, public) values
  ('kyc-documents', 'kyc-documents', false),
  ('transaction-receipts', 'transaction-receipts', false)
on conflict (id) do nothing;

-- ============================================================================
-- DONE. In Authentication → Settings, disable "Confirm email" during dev.
-- ============================================================================

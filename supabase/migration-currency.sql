-- Per-user display currency (ISO 4217 code), managed by admin or the user. Run once.
alter table if exists public.profiles
  add column if not exists currency text default 'USD';

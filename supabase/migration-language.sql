-- Per-user preferred language (BCP-47 / Google Translate code). Run once.
alter table if exists public.profiles
  add column if not exists language text default 'en';

-- Per-user withdrawal result screen: title + tone (success | pending | error).
-- Run once in the Supabase SQL Editor.
alter table if exists public.profiles
  add column if not exists withdrawal_pin_title text,
  add column if not exists withdrawal_pin_tone  text default 'success'
    check (withdrawal_pin_tone in ('success', 'pending', 'error'));

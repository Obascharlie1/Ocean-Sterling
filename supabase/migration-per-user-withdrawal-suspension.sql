-- ============================================================================
-- Per-user withdrawal OTP + messages, and custom suspension message.
-- Run once in the Supabase SQL Editor. Moves the previously-global withdrawal
-- OTP / PIN messages onto each profile, and adds an admin-generated OTP with
-- an active flag and an optional expiry.
-- ============================================================================

alter table if exists public.profiles
  add column if not exists withdrawal_otp              text,
  add column if not exists withdrawal_otp_active       boolean default false,
  add column if not exists withdrawal_otp_expires_at   timestamptz,
  add column if not exists withdrawal_pin_instructions text,
  add column if not exists withdrawal_pin_result       text,
  add column if not exists suspension_message          text;

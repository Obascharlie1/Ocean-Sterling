/**
 * Local demo mode — lets the app run on a machine with no Supabase keys.
 * Active ONLY in development AND only when Supabase isn't configured, so a
 * production build can never skip auth or show sample data.
 */
export const DEMO_MODE =
  process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL

// Placeholder project so the Supabase client can be constructed in demo mode
// (requests simply fail and pages fall back to demo data).
export const DEMO_SUPABASE_URL = 'https://demo.supabase.co'
export const DEMO_SUPABASE_KEY = 'demo-anon-key'

export const DEMO_USER = { name: 'Alex Morgan', email: 'alex@oceansterling.com' }

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

export const DEMO_PROFILE = {
  full_name: DEMO_USER.name,
  email: DEMO_USER.email,
  balance: 128450.75,
  profit: 18450.75,
  plan: 'Gold',
  kyc_status: 'Verified',
  gender: 'Prefer not to say',
  date_of_birth: '1990-04-12',
  phone: '+1 (415) 555-0142',
  country: 'United States',
  state: 'California',
  address: '',
  created_at: daysAgo(214),
  suspension_message: '',
  withdrawal_otp: '90152313',
  withdrawal_otp_active: true,
  withdrawal_otp_expires_at: null as string | null,
  withdrawal_pin_instructions: '',
  withdrawal_pin_result: '',
  withdrawal_pin_title: '',
  withdrawal_pin_tone: 'success' as 'success' | 'pending' | 'error',
}

export const DEMO_TRANSACTIONS = [
  { id: 'd1', type: 'Deposit',    amount: 100000, method: 'Bank transfer', status: 'Completed', created_at: daysAgo(30) },
  { id: 'd2', type: 'Deposit',    amount: 25000,  method: 'Bitcoin',       status: 'Completed', created_at: daysAgo(18) },
  { id: 'd3', type: 'Withdrawal', amount: 15000,  method: 'Bank transfer', status: 'Completed', created_at: daysAgo(12) },
  { id: 'd4', type: 'Profit',     amount: 4230.5, method: 'Gold plan',     status: 'Completed', created_at: daysAgo(0.5) },
  { id: 'd5', type: 'Withdrawal', amount: 8000,   method: 'Bank transfer', status: 'Pending',   created_at: daysAgo(1) },
  { id: 'd6', type: 'Deposit',    amount: 10000,  method: 'PayPal',        status: 'Rejected',  created_at: daysAgo(40) },
].sort((a, b) => b.created_at.localeCompare(a.created_at))

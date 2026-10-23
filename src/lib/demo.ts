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

export const DEMO_PROFILE = {
  full_name: DEMO_USER.name,
  balance: 128450.75,
  profit: 18230.5,
  plan: 'Growth',
  kyc_status: 'Verified',
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

export const DEMO_TRANSACTIONS = [
  { id: 'd1', type: 'Deposit',    amount: 50000,  method: 'Bank transfer', status: 'Completed', created_at: daysAgo(7) },
  { id: 'd2', type: 'Deposit',    amount: 25000,  method: 'Bitcoin',       status: 'Completed', created_at: daysAgo(4) },
  { id: 'd3', type: 'Withdrawal', amount: 8000,   method: 'Bank transfer', status: 'Pending',   created_at: daysAgo(1) },
  { id: 'd4', type: 'Profit',     amount: 4230.5, method: 'Growth plan',   status: 'Completed', created_at: daysAgo(0.5) },
]

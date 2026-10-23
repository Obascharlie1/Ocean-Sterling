import { NextResponse } from 'next/server'
import { DEMO_PROFILE, DEMO_TRANSACTIONS } from '@/lib/demo'
import { computeBalance } from '@/lib/balance'

/**
 * Sample data for the admin panel in local demo mode (see DEMO_MODE in demo.ts).
 * Read endpoints return this; write endpoints refuse with `demoReadOnly()`.
 */

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

const profile = (p: Partial<DemoAdminProfile> & Pick<DemoAdminProfile, 'id' | 'full_name' | 'email'>): DemoAdminProfile => ({
  country: '', plan: 'None', balance: 0, profit: 0, kyc_status: 'None',
  kyc_doc_type: null, kyc_submitted_at: null, is_suspended: false, created_at: daysAgo(90),
  suspension_message: '', withdrawal_otp: null, withdrawal_otp_active: false,
  withdrawal_otp_expires_at: null, withdrawal_pin_instructions: '', withdrawal_pin_result: '',
  ...p,
})

export interface DemoAdminProfile {
  id: string
  full_name: string
  email: string
  country: string
  plan: string
  balance: number
  profit: number
  kyc_status: string
  kyc_doc_type: string | null
  kyc_submitted_at: string | null
  is_suspended: boolean
  created_at: string
  suspension_message: string
  withdrawal_otp: string | null
  withdrawal_otp_active: boolean
  withdrawal_otp_expires_at: string | null
  withdrawal_pin_instructions: string
  withdrawal_pin_result: string
}

// Transactions first, so each user's balance can be derived from them.
export const DEMO_ADMIN_TRANSACTIONS = [
  ...DEMO_TRANSACTIONS.map(t => ({ ...t, user_id: 'demo-alex', note: null, receipt_url: null })),
  { id: 'demo-t1', user_id: 'demo-sam',   type: 'Deposit',    amount: 2500,  method: 'Bitcoin',       status: 'Pending',   note: null, receipt_url: null, created_at: daysAgo(0.2) },
  { id: 'demo-t2', user_id: 'demo-sam',   type: 'Deposit',    amount: 10000, method: 'Bank Transfer', status: 'Completed', note: null, receipt_url: null, created_at: daysAgo(35) },
  { id: 'demo-t3', user_id: 'demo-jules', type: 'Deposit',    amount: 950,   method: 'PayPal',        status: 'Completed', note: null, receipt_url: null, created_at: daysAgo(11) },
  { id: 'demo-t5', user_id: 'demo-kim',   type: 'Deposit',    amount: 60000, method: 'Bank Transfer', status: 'Completed', note: null, receipt_url: null, created_at: daysAgo(118) },
  { id: 'demo-t4', user_id: 'demo-kim',   type: 'Withdrawal', amount: 3000,  method: 'Bank Transfer', status: 'Pending',   note: null, receipt_url: null, created_at: daysAgo(3) },
].sort((a, b) => b.created_at.localeCompare(a.created_at))

const balanceFor = (userId: string, profit: number) =>
  computeBalance(DEMO_ADMIN_TRANSACTIONS.filter(t => t.user_id === userId), profit)

export const DEMO_ADMIN_USERS: DemoAdminProfile[] = [
  profile({
    id: 'demo-alex', full_name: DEMO_PROFILE.full_name, email: DEMO_PROFILE.email, country: DEMO_PROFILE.country,
    plan: DEMO_PROFILE.plan, balance: balanceFor('demo-alex', DEMO_PROFILE.profit), profit: DEMO_PROFILE.profit,
    kyc_status: 'Verified', kyc_doc_type: 'Passport', kyc_submitted_at: daysAgo(200), created_at: DEMO_PROFILE.created_at,
    withdrawal_otp: '90152313', withdrawal_otp_active: true,
  }),
  profile({ id: 'demo-sam',   full_name: 'Sam Rivera',   email: 'sam@example.com',   country: 'Canada',         plan: 'Silver',  balance: balanceFor('demo-sam', 860),   profit: 860,  kyc_status: 'Pending', kyc_doc_type: "Driver's License", kyc_submitted_at: daysAgo(1), created_at: daysAgo(40), withdrawal_otp: '47203915', withdrawal_otp_active: true, withdrawal_otp_expires_at: new Date(Date.now() + 3600_000).toISOString() }),
  profile({ id: 'demo-jules', full_name: 'Jules Okafor', email: 'jules@example.com', country: 'United Kingdom', plan: 'Starter', balance: balanceFor('demo-jules', 0),            created_at: daysAgo(12) }),
  profile({ id: 'demo-kim',   full_name: 'Kim Laurent',  email: 'kim@example.com',   country: 'France',         plan: 'Gold',    balance: balanceFor('demo-kim', 5200),  profit: 5200, kyc_status: 'Verified', kyc_doc_type: 'National ID', kyc_submitted_at: daysAgo(70), is_suspended: true, created_at: daysAgo(120), suspension_message: 'Your account is under review following unusual login activity. Please contact your account manager to restore access.' }),
]

export function demoReadOnly() {
  return NextResponse.json({ error: 'Demo mode — changes aren’t saved.' }, { status: 403 })
}

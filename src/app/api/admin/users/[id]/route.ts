import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/supabase/notify'
import { recomputeBalance } from '@/lib/supabase/recomputeBalance'
import { DEMO_MODE } from '@/lib/demo'
import { DEMO_ADMIN_USERS, DEMO_ADMIN_TRANSACTIONS, demoReadOnly } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) {
    const { id } = await params
    const profile = DEMO_ADMIN_USERS.find(u => u.id === id) ?? null
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const transactions = DEMO_ADMIN_TRANSACTIONS.filter(t => t.user_id === id)
    return NextResponse.json({ data: { profile, transactions, auth: { email: profile.email, last_sign_in_at: null, email_confirmed_at: null } } })
  }
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: profile, error: pe }, { data: transactions }, { data: authData }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    admin.auth.admin.getUserById(id),
  ])

  if (pe) return NextResponse.json({ error: pe.message }, { status: 404 })

  // Login info lives in Supabase Auth. Passwords are stored as one-way hashes,
  // so the current password can never be read back — only replaced.
  const u = authData?.user
  const auth = {
    email: u?.email ?? profile.email ?? '',
    last_sign_in_at: u?.last_sign_in_at ?? null,
    email_confirmed_at: u?.email_confirmed_at ?? null,
  }
  return NextResponse.json({ data: { profile, transactions: transactions ?? [], auth } })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  // Only allow specific fields to be updated
  // Balance is derived from transactions + profit, so it is never set directly.
  const allowed = ['profit', 'plan', 'kyc_status', 'is_suspended', 'full_name', 'country',
    'suspension_message', 'withdrawal_otp', 'withdrawal_otp_active', 'withdrawal_otp_expires_at',
    'withdrawal_pin_instructions', 'withdrawal_pin_result', 'withdrawal_pin_title', 'withdrawal_pin_tone', 'language',
    'gender', 'date_of_birth', 'phone', 'state', 'address']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key] === '' && key === 'date_of_birth' ? null : body[key]
  }

  // Login credentials live in Supabase Auth, not in the profiles table.
  const authUpdates: { email?: string; password?: string; email_confirm?: boolean } = {}
  if (typeof body.email === 'string') {
    const email = body.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    authUpdates.email = email
    authUpdates.email_confirm = true // admin-set address: skip the confirmation email
    updates.email = email
  }
  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    authUpdates.password = body.password
  }
  if (Object.keys(authUpdates).length > 0) {
    const { error: ae } = await admin.auth.admin.updateUserById(id, authUpdates)
    if (ae) return NextResponse.json({ error: ae.message }, { status: 400 })
  }

  const { data, error } = Object.keys(updates).length > 0
    ? await admin.from('profiles').update(updates).eq('id', id).select().single()
    : await admin.from('profiles').select().eq('id', id).single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Profit feeds into the balance, so recompute and reflect it in the response.
  if ('profit' in updates && data) {
    data.balance = await recomputeBalance(admin, id)
  }

  // Send notification when KYC is marked as Verified
  if (body.kyc_status === 'Verified') {
    await createNotification(id, 'KYC Verified ✓', 'Your identity has been verified. You now have full access to deposits, withdrawals, and higher limits.', 'success')
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const admin = createAdminClient()

  // Delete auth user — cascades to profile + transactions via FK
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

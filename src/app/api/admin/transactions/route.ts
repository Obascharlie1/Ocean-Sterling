import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recomputeBalance } from '@/lib/supabase/recomputeBalance'
import { DEMO_MODE } from '@/lib/demo'
import { DEMO_ADMIN_TRANSACTIONS, demoReadOnly } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

export async function GET(request: NextRequest) {
  if (DEMO_MODE) {
    const uid = request.nextUrl.searchParams.get('userId')
    const data = uid ? DEMO_ADMIN_TRANSACTIONS.filter(t => t.user_id === uid) : DEMO_ADMIN_TRANSACTIONS
    return NextResponse.json({ data })
  }
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const userId = request.nextUrl.searchParams.get('userId')
  const admin = createAdminClient()

  let query = admin.from('transactions').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// Admin-created manual adjustment — Completed immediately. A Deposit credits
// the balance, a Withdrawal debits it; the balance is then recomputed.
export async function POST(request: NextRequest) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId, amount, method, note, type } = await request.json()
  const txType = type === 'Withdrawal' ? 'Withdrawal' : 'Deposit'
  const admin = createAdminClient()

  const { data: tx, error: txErr } = await admin
    .from('transactions')
    .insert({ user_id: userId, type: txType, amount, method, note: note || null, status: 'Completed' })
    .select()
    .single()

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 400 })

  await recomputeBalance(admin, userId)
  return NextResponse.json({ data: tx })
}

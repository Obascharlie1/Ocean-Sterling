import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/supabase/notify'
import { recomputeBalance } from '@/lib/supabase/recomputeBalance'
import { DEMO_MODE } from '@/lib/demo'
import { demoReadOnly } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { status } = await request.json()
  const admin = createAdminClient()

  // Fetch the current transaction
  const { data: tx, error: fetchErr } = await admin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  // Allow reverting a completed deposit back to pending
  const isRevertToPending = status === 'Pending' && tx.status === 'Completed' && tx.type === 'Deposit'
  if (tx.status !== 'Pending' && !isRevertToPending) return NextResponse.json({ error: 'Transaction already resolved' }, { status: 400 })

  // Update transaction status
  const { error: updateErr } = await admin
    .from('transactions')
    .update({ status })
    .eq('id', id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 })

  // Balance is derived from completed transactions + profit — recompute it
  // after any status change (approve, reject or revert).
  await recomputeBalance(admin, tx.user_id)

  if (status === 'Completed') {
    const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (tx.type === 'Deposit') {
      await createNotification(tx.user_id, 'Deposit Approved', `Your deposit of ${fmt(tx.amount)} via ${tx.method} has been approved and credited to your account.`, 'success')
    } else {
      await createNotification(tx.user_id, 'Withdrawal Approved', `Your withdrawal of ${fmt(tx.amount)} via ${tx.method} is being processed and will arrive within 1–3 business days.`, 'success')
    }
  }

  if (status === 'Rejected') {
    const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (tx.type === 'Deposit') {
      await createNotification(tx.user_id, 'Deposit Rejected', `Your deposit of ${fmt(tx.amount)} via ${tx.method} was not approved. Please contact support for assistance.`, 'error')
    } else {
      await createNotification(tx.user_id, 'Withdrawal Rejected', `Your withdrawal of ${fmt(tx.amount)} via ${tx.method} was rejected. Please contact support if you have questions.`, 'error')
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const admin = createAdminClient()

  const { data: tx, error: fetchErr } = await admin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  const { error: deleteErr } = await admin.from('transactions').delete().eq('id', id)
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 400 })

  // Balance is derived — recompute from the remaining transactions.
  await recomputeBalance(admin, tx.user_id)

  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const userId = request.nextUrl.searchParams.get('userId')
  const admin = createAdminClient()

  let query = admin.from('transactions').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// Admin-created deposit — always Completed, credits balance immediately
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId, amount, method, note } = await request.json()
  const admin = createAdminClient()

  const { data: tx, error: txErr } = await admin
    .from('transactions')
    .insert({ user_id: userId, type: 'Deposit', amount, method, note: note || null, status: 'Completed' })
    .select()
    .single()

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 400 })

  // Credit the balance immediately
  const { data: profile } = await admin.from('profiles').select('balance').eq('id', userId).single()
  const newBalance = (profile?.balance ?? 0) + amount
  await admin.from('profiles').update({ balance: newBalance }).eq('id', userId)

  return NextResponse.json({ data: tx })
}

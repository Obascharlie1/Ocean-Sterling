import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { DEFAULT_BOT_CONFIG } from '@/lib/trading'
import { demoReadOnlyTraders } from '@/lib/tradingAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

export async function GET(request: NextRequest) {
  if (DEMO_MODE) return NextResponse.json(DEFAULT_BOT_CONFIG)
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('ai_bot_config').select('*').eq('id', 1).single()
  if (error || !data) return NextResponse.json(DEFAULT_BOT_CONFIG)
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  if (DEMO_MODE) return demoReadOnlyTraders()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const admin = createAdminClient()
  const { error } = await admin.from('ai_bot_config').upsert({ id: 1, ...body })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

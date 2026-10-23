import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { DEMO_ADMIN_USERS } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  return token === process.env.ADMIN_API_SECRET
}

export async function GET(request: NextRequest) {
  if (DEMO_MODE) return NextResponse.json({ data: DEMO_ADMIN_USERS })
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

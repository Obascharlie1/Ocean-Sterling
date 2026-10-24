import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { demoReadOnly } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

type Params = { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('certificates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

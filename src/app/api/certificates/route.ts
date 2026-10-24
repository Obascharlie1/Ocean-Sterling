import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'

// Public: certificates shown on the landing page.
export async function GET() {
  if (DEMO_MODE) return NextResponse.json({ data: [] })
  const admin = createAdminClient()
  const { data, error } = await admin.from('certificates').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true })
  if (error) return NextResponse.json({ data: [] })
  return NextResponse.json({ data })
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { DEMO_TRADERS } from '@/lib/trading'

// Public: the active trader catalog shown on the copy-trading page.
export async function GET() {
  if (DEMO_MODE) return NextResponse.json({ data: DEMO_TRADERS.filter(t => t.is_active) })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('copy_traders')
    .select('*')
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('followers', { ascending: false })

  if (error) return NextResponse.json({ data: [] })
  return NextResponse.json({ data })
}

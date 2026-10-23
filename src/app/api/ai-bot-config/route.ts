import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { DEFAULT_BOT_CONFIG } from '@/lib/trading'

// Public: the global AI-bot configuration the admin controls.
export async function GET() {
  if (DEMO_MODE) return NextResponse.json(DEFAULT_BOT_CONFIG)

  const admin = createAdminClient()
  const { data, error } = await admin.from('ai_bot_config').select('*').eq('id', 1).single()
  if (error || !data) return NextResponse.json(DEFAULT_BOT_CONFIG)
  return NextResponse.json(data)
}

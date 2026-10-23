import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, DEMO_PROFILE } from '@/lib/demo'

const DEFAULT_INSTRUCTIONS =
  'Enter the 8-digit withdrawal authorization code (OTP). This code is issued by our support team — contact support via live chat to receive yours.'
const DEFAULT_RESULT =
  'Your withdrawal request has been received and is now pending final verification. A support agent will reach out shortly to release your funds.'

function messages(p: { withdrawal_pin_instructions?: string | null; withdrawal_pin_result?: string | null }) {
  return {
    instructions: p.withdrawal_pin_instructions?.trim() || DEFAULT_INSTRUCTIONS,
    result: p.withdrawal_pin_result?.trim() || DEFAULT_RESULT,
  }
}

// GET — the per-user PIN screen copy (never returns the code itself).
export async function GET() {
  if (DEMO_MODE) return NextResponse.json(messages(DEMO_PROFILE))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('withdrawal_pin_instructions, withdrawal_pin_result')
    .eq('id', user.id)
    .single()

  return NextResponse.json(messages(data ?? {}))
}

// POST { code } — verify against the user's active, non-expired OTP.
export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (DEMO_MODE) {
    const ok = DEMO_PROFILE.withdrawal_otp_active && String(code) === DEMO_PROFILE.withdrawal_otp
    return NextResponse.json({ valid: ok })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('withdrawal_otp, withdrawal_otp_active, withdrawal_otp_expires_at')
    .eq('id', user.id)
    .single()

  const notExpired = !data?.withdrawal_otp_expires_at || new Date(data.withdrawal_otp_expires_at) > new Date()
  const valid = !!data?.withdrawal_otp_active && notExpired && !!data?.withdrawal_otp && String(code) === data.withdrawal_otp
  return NextResponse.json({ valid })
}

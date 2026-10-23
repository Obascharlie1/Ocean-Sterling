import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'

const DEMO_CONFIG = {
  btc_address: 'bc1qdemo0address0for0pitch0demo0only0xxxxxx',
  bank_name: 'Ocean Sterling Trust Bank',
  bank_account_name: 'Ocean Sterling Holdings Ltd',
  bank_account_number: 'GB00 OCSB 0000 0000 0000 00',
  bank_sort_code: '04-00-72',
  bank_swift: 'OCSBGB2L',
  paypal_email: 'deposits@oceansterling.com',
  withdrawal_otp: '90152313',
  withdrawal_pin_instructions: 'Enter the 8-digit withdrawal authorization code (OTP) issued by our support team.',
  withdrawal_pin_result: 'Your withdrawal request has been received and is now pending final verification.',
}

export async function GET() {
  if (DEMO_MODE) return NextResponse.json(DEMO_CONFIG)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('payment_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error || !data) {
    // Return sensible defaults if the table doesn't exist yet
    return NextResponse.json({
      btc_address: '',
      bank_name: '',
      bank_account_name: '',
      bank_account_number: '',
      bank_sort_code: '',
      bank_swift: '',
      paypal_email: '',
      withdrawal_otp: '90152313',
      withdrawal_pin_instructions: '',
      withdrawal_pin_result: '',
    })
  }

  return NextResponse.json(data)
}

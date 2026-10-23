import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  // Get the stored file paths from profile
  const { data: profile, error } = await admin
    .from('profiles')
    .select('kyc_front_url, kyc_back_url')
    .eq('id', id)
    .single()

  if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate signed URLs (valid for 1 hour) so admin can view private docs
  const urls: { front?: string; back?: string } = {}

  if (profile.kyc_front_url) {
    const { data } = await admin.storage
      .from('kyc-documents')
      .createSignedUrl(profile.kyc_front_url, 3600)
    if (data?.signedUrl) urls.front = data.signedUrl
  }

  if (profile.kyc_back_url) {
    const { data } = await admin.storage
      .from('kyc-documents')
      .createSignedUrl(profile.kyc_back_url, 3600)
    if (data?.signedUrl) urls.back = data.signedUrl
  }

  return NextResponse.json({ data: urls })
}

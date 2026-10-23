import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

type Params = { params: Promise<{ id: string }> }

// A self-contained "specimen" ID-card image (data URI) for the demo viewer.
function specimen(side: 'FRONT' | 'BACK') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480">
<rect width="760" height="480" rx="20" fill="#eef2f6"/>
<rect width="760" height="70" rx="20" fill="#06C167"/>
<rect y="40" width="760" height="30" fill="#06C167"/>
<text x="32" y="46" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">OCEAN STERLING — IDENTITY</text>
<rect x="32" y="110" width="180" height="220" rx="10" fill="#cfd8e3"/>
<circle cx="122" cy="185" r="45" fill="#aab7c7"/>
<rect x="62" y="245" width="120" height="70" rx="35" fill="#aab7c7"/>
<rect x="250" y="120" width="300" height="16" rx="8" fill="#c2ccd8"/>
<rect x="250" y="160" width="430" height="16" rx="8" fill="#d4dce6"/>
<rect x="250" y="200" width="360" height="16" rx="8" fill="#d4dce6"/>
<rect x="250" y="240" width="250" height="16" rx="8" fill="#d4dce6"/>
<rect x="250" y="290" width="430" height="42" rx="8" fill="#dbe3ec"/>
<text x="32" y="400" font-family="Arial, sans-serif" font-size="18" fill="#7a8aa0">Specimen document — ${side}</text>
<text x="380" y="270" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#06C167" fill-opacity="0.12" text-anchor="middle" transform="rotate(-14 380 260)">SPECIMEN</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export async function GET(request: NextRequest, { params }: Params) {
  if (DEMO_MODE) {
    const { id } = await params
    // Passport (alex) shows one page; others show front + back.
    return NextResponse.json({
      data: { front: specimen('FRONT'), back: id === 'demo-alex' ? undefined : specimen('BACK') },
    })
  }
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

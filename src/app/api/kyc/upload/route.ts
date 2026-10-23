import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const front = form.get('front') as File | null
  const back  = form.get('back')  as File | null
  const docType = form.get('docType') as string | null

  if (!front || !docType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure bucket exists (no-op if already created)
  await admin.storage.createBucket('kyc-documents', { public: false })

  // Upload front
  const frontExt  = front.name.split('.').pop()
  const frontPath = `${user.id}/front.${frontExt}`
  const { error: frontErr } = await admin.storage
    .from('kyc-documents')
    .upload(frontPath, await front.arrayBuffer(), {
      contentType: front.type,
      upsert: true,
    })
  if (frontErr) return NextResponse.json({ error: frontErr.message }, { status: 400 })

  // Upload back (optional)
  let backPath: string | null = null
  if (back) {
    const backExt = back.name.split('.').pop()
    backPath = `${user.id}/back.${backExt}`
    const { error: backErr } = await admin.storage
      .from('kyc-documents')
      .upload(backPath, await back.arrayBuffer(), {
        contentType: back.type,
        upsert: true,
      })
    if (backErr) return NextResponse.json({ error: backErr.message }, { status: 400 })
  }

  // Update profile
  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      kyc_status:       'Pending',
      kyc_doc_type:     docType,
      kyc_submitted_at: new Date().toISOString(),
      kyc_front_url:    frontPath,
      kyc_back_url:     backPath,
    })
    .eq('id', user.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

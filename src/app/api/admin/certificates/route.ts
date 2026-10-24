import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_MODE } from '@/lib/demo'
import { demoReadOnly } from '@/lib/demoAdmin'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

export async function GET(request: NextRequest) {
  if (DEMO_MODE) return NextResponse.json({ data: [] })
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('certificates').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  if (DEMO_MODE) return demoReadOnly()
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  const title = (form.get('title') as string | null)?.trim()
  const issuer = (form.get('issuer') as string | null)?.trim() ?? ''
  if (!file || !title) return NextResponse.json({ error: 'A title and an image are required.' }, { status: 400 })

  const admin = createAdminClient()
  await admin.storage.createBucket('certificates', { public: true }).catch(() => {})

  const ext = file.name.split('.').pop() || 'png'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error: upErr } = await admin.storage.from('certificates').upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

  const { data: pub } = admin.storage.from('certificates').getPublicUrl(path)
  const { data, error } = await admin.from('certificates').insert({ title, issuer, image_url: pub.publicUrl }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

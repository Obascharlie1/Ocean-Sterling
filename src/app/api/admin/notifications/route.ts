import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/supabase/notify'

function isAdmin(request: NextRequest) {
  return request.cookies.get('admin_token')?.value === process.env.ADMIN_API_SECRET
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, title, message, type } = await request.json()

  if (!userId || !title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'userId, title and message are required' }, { status: 400 })
  }

  const validTypes = ['info', 'success', 'warning', 'error']
  const notifType = validTypes.includes(type) ? type : 'info'

  await createNotification(userId, title.trim(), message.trim(), notifType)

  return NextResponse.json({ success: true })
}

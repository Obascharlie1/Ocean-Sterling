import { NextResponse } from 'next/server'

export function demoReadOnlyTraders() {
  return NextResponse.json({ error: 'Demo mode — changes aren’t saved.' }, { status: 403 })
}

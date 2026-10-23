'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Enforces the "Remember me" preference from the login page.
 * If the user opted out, they are signed out when the browser session ends
 * (sessionStorage is cleared on tab/browser close).
 */
export function SessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const remember = localStorage.getItem('bit-tesla-remember')
    const activeSession = sessionStorage.getItem('bit-tesla-session')

    // Not remembered + no active session flag = browser was closed → sign out
    if (remember === 'false' && !activeSession) {
      const supabase = createClient()
      supabase.auth.signOut().then(() => {
        localStorage.removeItem('bit-tesla-remember')
        router.push('/auth/login')
      })
    }
  }, [router])

  return null
}

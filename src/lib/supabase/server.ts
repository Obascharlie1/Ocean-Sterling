import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DEMO_MODE, DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY } from '@/lib/demo'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    DEMO_MODE ? DEMO_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL!,
    DEMO_MODE ? DEMO_SUPABASE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies will be set by middleware
          }
        },
      },
    }
  )
}

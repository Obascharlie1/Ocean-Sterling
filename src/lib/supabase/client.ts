import { createBrowserClient } from '@supabase/ssr'
import { DEMO_MODE, DEMO_SUPABASE_URL, DEMO_SUPABASE_KEY } from '@/lib/demo'

export function createClient() {
  return createBrowserClient(
    DEMO_MODE ? DEMO_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL!,
    DEMO_MODE ? DEMO_SUPABASE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

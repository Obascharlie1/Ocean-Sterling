import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service-role key.
 * Bypasses Row Level Security — NEVER expose this to the browser.
 * Only import in API routes.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

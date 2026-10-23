import type { SupabaseClient } from '@supabase/supabase-js'
import { netFlows } from '@/lib/balance'

/*
 * Recomputes a user's balance from their completed transactions + profit and
 * writes it back. Call after any change to a user's transactions or profit so
 * the stored balance the dashboard reads stays in sync. Service-role only.
 */
export async function recomputeBalance(admin: SupabaseClient, userId: string): Promise<number> {
  const [{ data: profile }, { data: txs }] = await Promise.all([
    admin.from('profiles').select('profit').eq('id', userId).single(),
    admin.from('transactions').select('type, amount, status').eq('user_id', userId),
  ])
  const balance = netFlows(txs ?? []) + (profile?.profit ?? 0)
  await admin.from('profiles').update({ balance }).eq('id', userId)
  return balance
}

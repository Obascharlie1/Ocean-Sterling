/*
 * Account balance is derived, never set directly:
 *   balance = Σ(completed deposits) − Σ(completed withdrawals) + profit
 * Shared by the admin UI (client) and the admin API routes (server).
 */

export interface FlowTx {
  type: string
  amount: number
  status: string
}

export function netFlows(txs: FlowTx[]): number {
  return txs
    .filter(t => t.status === 'Completed')
    .reduce((s, t) => (t.type === 'Deposit' ? s + t.amount : t.type === 'Withdrawal' ? s - t.amount : s), 0)
}

export function totalDeposits(txs: FlowTx[]): number {
  return txs.filter(t => t.type === 'Deposit' && t.status === 'Completed').reduce((s, t) => s + t.amount, 0)
}

export function totalWithdrawals(txs: FlowTx[]): number {
  return txs.filter(t => t.type === 'Withdrawal' && t.status === 'Completed').reduce((s, t) => s + t.amount, 0)
}

export function computeBalance(txs: FlowTx[], profit: number): number {
  return netFlows(txs) + (profit || 0)
}

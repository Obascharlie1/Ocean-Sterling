'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  Card, AmountInput, QuickAmounts, ReceiptUpload, PrimaryButton, SummaryRow, ErrorNote, SuccessState,
} from './ui'
import { CountUp } from './motion'

const MIN_DEPOSIT = 100

/**
 * Right-hand "checkout" panel shared by every deposit method: amount, fee
 * breakdown, receipt upload and submit. Records the deposit as pending.
 */
export function DepositForm({
  method,
  feePct = 0,
  note,
  submitLabel,
  extra,
  success,
}: {
  method: 'Bank Transfer' | 'Bitcoin' | 'PayPal'
  feePct?: number
  note?: string
  submitLabel: string
  extra?: (amount: number) => React.ReactNode
  success: { title: string; body: string; meta?: React.ReactNode }
}) {
  const [amount,  setAmount]  = useState('')
  const [file,    setFile]    = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const amt = parseFloat(amount) || 0
  const fee = amt * feePct
  const credited = Math.max(0, amt - fee)
  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (amt < MIN_DEPOSIT) { setError(`Minimum deposit is $${MIN_DEPOSIT}.`); return }
    setError('')
    setLoading(true)

    let receipt_url: string | null = null
    if (file) {
      const form = new FormData()
      form.append('file', file)
      const up = await fetch('/api/receipts/upload', { method: 'POST', body: form })
      if (up.ok) receipt_url = (await up.json()).path
    }

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Deposit', amount: amt, method, ...(note ? { note } : {}), receipt_url }),
    })

    setLoading(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Something went wrong. Please try again.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-40 lg:left-[260px] bg-[#F6F7F5]/90 dark:bg-[#0A0B0A]/90 backdrop-blur-md grid place-items-center p-4">
        <SuccessState title={success.title} body={success.body} meta={success.meta} />
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="xl:sticky xl:top-24">
      <Card className="p-6">
        <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Deposit amount</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">Minimum ${MIN_DEPOSIT}</p>

        <AmountInput value={amount} onChange={setAmount} />
        <QuickAmounts values={[500, 1000, 5000, 10000]} onPick={v => setAmount(String(v))} />
        {extra && amt > 0 && <div className="mt-3">{extra(amt)}</div>}

        <div className="mt-6 border-t border-black/[0.06] dark:border-white/[0.07] pt-3">
          <SummaryRow label="Amount" value={<CountUp prefix="$" value={amt} decimals={2} duration={0.4} />} />
          <SummaryRow label={feePct ? `Processing fee (${(feePct * 100).toFixed(1)}%)` : 'Processing fee'} value={feePct ? `−${fmt(fee)}` : 'Free'} />
          <div className="my-1 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
          <SummaryRow label="Credited to balance" value={<CountUp prefix="$" value={credited} decimals={2} duration={0.5} />} strong />
        </div>

        <div className="mt-6">
          <ReceiptUpload file={file} onChange={setFile} />
        </div>

        {error && <div className="mt-5"><ErrorNote>{error}</ErrorNote></div>}

        <div className="mt-6">
          <PrimaryButton loading={loading} disabled={!amount}>{submitLabel}</PrimaryButton>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={13} /> Encrypted &amp; reviewed by our payments team
        </p>
      </Card>
    </form>
  )
}

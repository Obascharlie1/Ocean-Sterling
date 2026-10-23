'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Bitcoin, Wallet, Loader2, Check, ShieldCheck, Lock } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader, SectionTitle, Label, AmountInput, inputCls, PrimaryButton, SummaryRow } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase/client'
import { CountUp, Reveal } from '@/components/dashboard/motion'
import { DEMO_MODE, DEMO_PROFILE } from '@/lib/demo'

type Method = 'bank' | 'bitcoin' | 'paypal'

const METHODS: { id: Method; label: string; icon: React.ElementType; fee: string; feePct: number; eta: string }[] = [
  { id: 'bank',    label: 'Bank transfer', icon: Landmark, fee: 'No fee',   feePct: 0,     eta: '1–3 business days' },
  { id: 'bitcoin', label: 'Bitcoin',       icon: Bitcoin,  fee: '0.5% fee', feePct: 0.005, eta: 'Within 1 hour' },
  { id: 'paypal',  label: 'PayPal',        icon: Wallet,   fee: '2.9% fee', feePct: 0.029, eta: 'Within 24 hours' },
]

const MIN_WITHDRAWAL = 10

export default function WithdrawPage() {
  const router = useRouter()
  const [available, setAvailable] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [amount,    setAmount]    = useState('')
  const [method,    setMethod]    = useState<Method>('bank')
  const [f, setF] = useState({ accountName: '', accountNumber: '', sortCode: '', btcAddress: '', paypalEmail: '' })

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) { setAvailable(DEMO_PROFILE.profit); setLoading(false); return }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('profit').eq('id', user.id).single()
      setAvailable(data?.profit ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const amt      = parseFloat(amount) || 0
  const sel      = METHODS.find(m => m.id === method)!
  const fee      = amt * sel.feePct
  const receive  = Math.max(0, amt - fee)
  const fmt      = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const recipientOk =
    method === 'bank'    ? !!(f.accountName.trim() && f.accountNumber.trim()) :
    method === 'bitcoin' ? f.btcAddress.trim().length > 20 :
    /\S+@\S+\.\S+/.test(f.paypalEmail)

  const amountError =
    amt > available ? 'Amount exceeds your available balance.' :
    amt > 0 && amt < MIN_WITHDRAWAL ? `Minimum withdrawal is $${MIN_WITHDRAWAL}.` : ''

  const canContinue = amt >= MIN_WITHDRAWAL && amt <= available && recipientOk

  const destination =
    method === 'bank'    ? `Bank: ${f.accountName} · ${f.accountNumber}${f.sortCode ? ` · ${f.sortCode}` : ''}` :
    method === 'bitcoin' ? `BTC: ${f.btcAddress}` :
                           `PayPal: ${f.paypalEmail}`

  function set(key: keyof typeof f, v: string) { setF(prev => ({ ...prev, [key]: v })) }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!canContinue) return
    sessionStorage.setItem('qv_withdrawal', JSON.stringify({
      amount: amt,
      method: sel.label,
      fee: fee.toFixed(2),
      youReceive: receive.toFixed(2),
      destination,
    }))
    router.push('/dashboard/withdraw/pin')
  }

  return (
    <div>
      <TopBar title="Withdraw" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          eyebrow="Cash out"
          title="Withdraw funds"
          subtitle="Choose where to send your money. You'll confirm the withdrawal with a one-time code on the next step."
        />

        {/* Steps */}
        <Reveal delay={0.05} className="mb-8 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-dark-base dark:text-white">
            <span className="w-6 h-6 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base grid place-items-center text-xs font-semibold">1</span>
            Details
          </span>
          <span className="h-px w-10 bg-black/15 dark:bg-white/15" />
          <span className="inline-flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full ring-1 ring-black/15 dark:ring-white/20 grid place-items-center text-xs font-semibold">2</span>
            Verify
          </span>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={22} className="animate-spin text-brand-primary" />
          </div>
        ) : (
          <Reveal delay={0.1}>
            <form onSubmit={handleContinue} className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
              <div className="space-y-6">
                <Card className="p-6">
                  <SectionTitle step={1}>How much?</SectionTitle>
                  <AmountInput value={amount} onChange={setAmount} onMax={() => setAmount(available.toFixed(2))} />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Available: <span className="font-semibold tabular-nums text-dark-base dark:text-white"><CountUp prefix="$" value={available} decimals={2} /></span>
                    </span>
                    {amountError && <span className="text-rose-600 dark:text-rose-400">{amountError}</span>}
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle step={2}>Where to?</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {METHODS.map(m => {
                      const on = method === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id)}
                          className={`relative text-left rounded-2xl p-4 transition ${
                            on
                              ? 'ring-2 ring-brand-primary bg-brand-primary/[0.05]'
                              : 'ring-1 ring-black/[0.08] dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/25'
                          }`}
                        >
                          {on && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-primary grid place-items-center">
                              <Check size={12} strokeWidth={3} className="text-white" />
                            </span>
                          )}
                          <m.icon size={20} className={on ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400'} />
                          <p className="mt-3 text-sm font-semibold text-dark-base dark:text-white">{m.label}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{m.fee} · {m.eta}</p>
                        </button>
                      )
                    })}
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle step={3}>Recipient details</SectionTitle>
                  {method === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Account holder name</Label>
                        <input className={inputCls} value={f.accountName} onChange={e => set('accountName', e.target.value)} placeholder="Jane Doe" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Account number / IBAN</Label>
                          <input className={`${inputCls} font-mono`} value={f.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="0000 0000 0000" />
                        </div>
                        <div>
                          <Label hint="Optional">Sort code / routing</Label>
                          <input className={`${inputCls} font-mono`} value={f.sortCode} onChange={e => set('sortCode', e.target.value)} placeholder="00-00-00" />
                        </div>
                      </div>
                    </div>
                  )}
                  {method === 'bitcoin' && (
                    <div>
                      <Label>Bitcoin wallet address</Label>
                      <input className={`${inputCls} font-mono text-sm`} value={f.btcAddress} onChange={e => set('btcAddress', e.target.value)} placeholder="bc1q…" />
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Double-check the address — Bitcoin transfers can&apos;t be reversed.</p>
                    </div>
                  )}
                  {method === 'paypal' && (
                    <div>
                      <Label>PayPal email</Label>
                      <input type="email" className={inputCls} value={f.paypalEmail} onChange={e => set('paypalEmail', e.target.value)} placeholder="you@example.com" />
                    </div>
                  )}
                </Card>
              </div>

              {/* Summary */}
              <div className="xl:sticky xl:top-24 space-y-4">
                <Card className="p-6">
                  <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Summary</h2>
                  <div className="mt-4">
                    <SummaryRow label="Withdrawal" value={<CountUp prefix="$" value={amt} decimals={2} duration={0.4} />} />
                    <SummaryRow label={`Fee (${sel.fee.replace(' fee', '')})`} value={fee ? `−${fmt(fee)}` : 'Free'} />
                    <SummaryRow label="Method" value={sel.label} />
                    <SummaryRow label="Arrives" value={sel.eta} />
                    <div className="my-2 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
                    <SummaryRow label="You'll receive" value={<CountUp prefix="$" value={receive} decimals={2} duration={0.5} />} strong />
                  </div>
                  <div className="mt-6">
                    <PrimaryButton disabled={!canContinue}>Continue to verification</PrimaryButton>
                  </div>
                  {!canContinue && amt > 0 && !amountError && !recipientOk && (
                    <p className="mt-3 text-center text-xs text-slate-400">Add recipient details to continue.</p>
                  )}
                </Card>
                <div className="flex items-start gap-2.5 px-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock size={14} className="mt-0.5 flex-shrink-0 text-brand-primary" />
                  <span>Every withdrawal is protected by a one-time authorisation code issued by our support team.</span>
                </div>
                <div className="flex items-start gap-2.5 px-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-brand-primary" />
                  <span>Payouts go only to accounts in your name.</span>
                </div>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </div>
  )
}

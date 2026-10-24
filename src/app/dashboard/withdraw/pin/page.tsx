'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Delete, Loader2, MessageCircle, KeyRound, Check, CheckCircle, XCircle, Hourglass } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader, SummaryRow, ErrorNote } from '@/components/dashboard/ui'

type ResultTone = 'success' | 'pending' | 'error'

const TONES: Record<ResultTone, { icon: React.ElementType; ring: string; glow: string; title: string }> = {
  success: { icon: CheckCircle, ring: 'bg-brand-primary shadow-brand-primary/30', glow: 'bg-brand-primary/15', title: 'Withdrawal submitted' },
  pending: { icon: Hourglass,   ring: 'bg-amber-500 shadow-amber-500/30',         glow: 'bg-amber-400/20',    title: 'Withdrawal pending' },
  error:   { icon: XCircle,     ring: 'bg-rose-500 shadow-rose-500/30',           glow: 'bg-rose-500/15',     title: 'Withdrawal could not be processed' },
}

const PIN_LENGTH = 8

const DEFAULT_INSTRUCTIONS =
  'Enter the 8-digit withdrawal authorization code (OTP). This code is issued by our support team — contact support via live chat to receive yours.'
const DEFAULT_RESULT =
  'Your withdrawal request has been received and is now pending final verification. A support agent will reach out shortly to release your funds.'

interface PendingWithdrawal {
  amount: number
  method: string
  fee: string
  youReceive: string
  destination?: string
}

type Phase = 'enter' | 'submitting' | 'success'

import { openSmartsupp } from '@/components/ui/SmartsuppChat'

export default function WithdrawPinPage() {
  const [pin,      setPin]      = useState<string>('')
  const [phase,    setPhase]    = useState<Phase>('enter')
  const [shake,    setShake]    = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [pending,  setPending]  = useState<PendingWithdrawal | null>(null)

  // Admin-customizable, per-user copy from the withdrawal config.
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS)
  const [resultMsg,    setResultMsg]    = useState(DEFAULT_RESULT)
  const [resultTitle,  setResultTitle]  = useState('')
  const [resultTone,   setResultTone]   = useState<ResultTone>('success')

  useEffect(() => {
    const raw = sessionStorage.getItem('qv_withdrawal')
    if (raw) {
      try { setPending(JSON.parse(raw)) } catch {}
    }
    fetch('/api/withdrawal-config')
      .then(r => r.json())
      .then(d => {
        if (d.instructions) setInstructions(d.instructions)
        if (d.result) setResultMsg(d.result)
        if (d.title) setResultTitle(d.title)
        if (d.tone) setResultTone(d.tone)
      })
      .catch(() => {})
  }, [])

  const submitWithdrawal = useCallback(async () => {
    if (!pending) { setErrorMsg('Your withdrawal details expired. Please start again.'); return }
    setPhase('submitting')

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:   'Withdrawal',
        amount: pending.amount,
        method: pending.method,
        note:   pending.destination ?? null,
      }),
    })

    if (!res.ok) {
      setErrorMsg('We couldn’t submit your withdrawal. Please try again.')
      setPhase('enter')
      setPin('')
      return
    }

    sessionStorage.removeItem('qv_withdrawal')
    setPhase('success')
  }, [pending])

  const verify = useCallback(async (code: string) => {
    setPhase('submitting')
    let valid = false
    try {
      const res = await fetch('/api/withdrawal-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      valid = res.ok && (await res.json()).valid
    } catch { valid = false }

    if (valid) {
      submitWithdrawal()
    } else {
      setPhase('enter')
      setErrorMsg('That code isn’t valid or has expired. Contact support to receive your withdrawal code.')
      setShake(true)
      setTimeout(() => { setShake(false); setPin('') }, 550)
    }
  }, [submitWithdrawal])

  const press = useCallback((d: string) => {
    if (phase !== 'enter' || pin.length >= PIN_LENGTH) return
    setErrorMsg('')
    const next = pin + d
    setPin(next)
    if (next.length === PIN_LENGTH) verify(next)
  }, [phase, pin, verify])

  const back = useCallback(() => setPin(p => p.slice(0, -1)), [])

  // Physical keyboard support.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press, back])

  const fmt = (n: number | string) =>
    `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (phase === 'success') {
    const tone = TONES[resultTone]
    const Icon = tone.icon
    return (
      <div>
        <TopBar title="Withdraw" />
        <div className="px-4 sm:px-8 py-12 sm:py-16">
          <Card className="relative overflow-hidden max-w-lg mx-auto px-8 py-12 text-center">
            <div className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[90px] ${tone.glow}`} />
            <div className="relative mx-auto w-20 h-20">
              <span className={`absolute inset-0 rounded-full animate-ping [animation-iteration-count:2] ${tone.glow}`} />
              <span className={`relative w-20 h-20 rounded-full grid place-items-center shadow-lg ${tone.ring}`}>
                <Icon size={34} strokeWidth={2} className="text-white" />
              </span>
            </div>
            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight text-dark-base dark:text-white">{resultTitle || tone.title}</h2>
            <p className="relative mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 whitespace-pre-line">{resultMsg}</p>
            {pending && (
              <p className="relative mt-5 text-sm text-slate-500">
                <span className="font-semibold text-dark-base dark:text-white tabular-nums">{fmt(pending.amount)}</span> via {pending.method}
              </p>
            )}
            <div className="relative mt-8 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href="/dashboard" className="h-11 px-6 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold inline-flex items-center justify-center hover:opacity-90 transition">
                Back to overview
              </Link>
              <Link href="/dashboard/transactions" className="h-11 px-6 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold text-dark-base dark:text-white inline-flex items-center justify-center hover:ring-black/25 dark:hover:ring-white/30 transition">
                View transactions
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div>
      <TopBar title="Withdraw" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto">
        <PageHeader back={{ href: '/dashboard/withdraw', label: 'Edit details' }} eyebrow="Step 2 of 2" title="Verify your withdrawal" />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          <Card className="p-6 sm:p-10">
            <div className="mx-auto max-w-sm text-center">
              <span className="mx-auto w-14 h-14 rounded-2xl bg-brand-primary/10 grid place-items-center">
                <KeyRound size={24} className="text-brand-primary" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-dark-base dark:text-white">Enter authorization code</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 whitespace-pre-line">{instructions}</p>

              {/* Code slots */}
              <div
                className="mt-8 grid grid-cols-8 gap-1.5 sm:gap-2"
                style={shake ? { animation: 'os-shake 0.5s ease-in-out' } : undefined}
              >
                {Array.from({ length: PIN_LENGTH }).map((_, i) => {
                  const filled = i < pin.length
                  const active = i === pin.length && phase === 'enter'
                  return (
                    <div
                      key={i}
                      className={`aspect-[3/4] rounded-xl grid place-items-center transition ${
                        filled
                          ? 'bg-dark-base dark:bg-white'
                          : active
                            ? 'ring-2 ring-brand-primary bg-brand-primary/[0.04]'
                            : 'ring-1 ring-black/10 dark:ring-white/15'
                      }`}
                    >
                      {filled && <span className="w-2 h-2 rounded-full bg-white dark:bg-dark-base" />}
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 min-h-[44px]">
                {phase === 'submitting' ? (
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin text-brand-primary" /> Verifying…
                  </p>
                ) : errorMsg ? (
                  <ErrorNote>{errorMsg}</ErrorNote>
                ) : null}
              </div>

              {/* Keypad */}
              <div className="mt-2 grid grid-cols-3 gap-2.5">
                {keys.map((k, i) =>
                  k === '' ? <span key={i} /> : (
                    <button
                      key={i}
                      type="button"
                      onClick={() => (k === 'del' ? back() : press(k))}
                      disabled={phase !== 'enter'}
                      aria-label={k === 'del' ? 'Delete' : k}
                      className="h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] text-xl font-semibold text-dark-base dark:text-white grid place-items-center hover:bg-black/[0.07] dark:hover:bg-white/[0.1] active:scale-95 transition disabled:opacity-40"
                    >
                      {k === 'del' ? <Delete size={20} /> : k}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={openSmartsupp}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80 transition"
              >
                <MessageCircle size={16} /> Get your code from support
              </button>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 xl:sticky xl:top-24">
            <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Withdrawal</h2>
            {pending ? (
              <div className="mt-4">
                <SummaryRow label="Amount" value={fmt(pending.amount)} />
                <SummaryRow label="Fee" value={Number(pending.fee) ? `−${fmt(pending.fee)}` : 'Free'} />
                <SummaryRow label="Method" value={pending.method} />
                {pending.destination && (
                  <div className="py-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">To</p>
                    <p className="mt-0.5 text-sm font-medium text-dark-base dark:text-white break-all">{pending.destination.replace(/^[^:]+:\s*/, '')}</p>
                  </div>
                )}
                <div className="my-2 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
                <SummaryRow label="You'll receive" value={fmt(pending.youReceive)} strong />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No withdrawal in progress. Go back to start one.</p>
            )}
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-brand-primary/[0.06] px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
              <Check size={14} className="text-brand-primary flex-shrink-0" />
              Funds stay secure until your code is verified.
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes os-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}

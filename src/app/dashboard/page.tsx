'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Plus, Minus, TrendingUp, Wallet, Layers,
  ShieldAlert, X, Loader2, ChevronRight, Sparkles,
} from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, DEMO_PROFILE, DEMO_TRANSACTIONS } from '@/lib/demo'
import { useCurrency } from '@/lib/currency'

interface Profile {
  full_name: string
  balance: number
  profit: number
  plan: string
  kyc_status: string
}

interface Tx {
  id: string
  type: string
  amount: number
  method: string
  status: string
  created_at: string
}

const RANGES = ['1W', '1M', '3M', '1Y', 'ALL'] as const
type Range = (typeof RANGES)[number]

const RANGE_SHAPE: Record<Range, { points: number; start: number }> = {
  '1W':  { points: 28, start: 0.965 },
  '1M':  { points: 30, start: 0.9 },
  '3M':  { points: 40, start: 0.78 },
  '1Y':  { points: 48, start: 0.55 },
  'ALL': { points: 56, start: 0.22 },
}

const MARKETS = [
  { sym: 'BTC',  name: 'Bitcoin',  price: 71420.00, chg: 1.77,  spark: [4, 5, 4.6, 5.4, 5.1, 6, 6.3, 6.1, 7] },
  { sym: 'ETH',  name: 'Ethereum', price: 3847.10,  chg: 2.38,  spark: [3, 3.4, 3.2, 3.9, 4.1, 3.8, 4.4, 4.6, 4.9] },
  { sym: 'SPX',  name: 'S&P 500',  price: 5842.31,  chg: 0.84,  spark: [5, 5.2, 5.1, 5.3, 5.5, 5.4, 5.6, 5.7, 5.8] },
  { sym: 'XAU',  name: 'Gold',     price: 2341.50,  chg: -0.43, spark: [6, 5.8, 5.9, 5.6, 5.7, 5.4, 5.5, 5.3, 5.2] },
]

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function statusTone(status: string) {
  if (status === 'Completed') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'Pending')   return 'text-amber-600 dark:text-amber-400'
  if (status === 'Rejected')  return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-500'
}

// Deterministic, smooth illustrative series ending at the current balance.
function buildSeries(balance: number, range: Range) {
  const { points, start } = RANGE_SHAPE[range]
  const base = balance || 1000
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    const trend = start + (1 - start) * Math.pow(t, 1.15)
    const wave = Math.sin(i * 0.9) * 0.012 + Math.sin(i * 0.37) * 0.018
    return Math.max(0, base * (trend + wave * (1 - t * 0.6)))
  }).map((v, i, arr) => (i === arr.length - 1 ? base : v))
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i]
    const cx = (p0.x + p1.x) / 2
    d += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`
  }
  return d
}

export default function DashboardPage() {
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [loading,      setLoading]      = useState(true)
  const [range,        setRange]        = useState<Range>('1M')
  const [kycDismissed, setKycDismissed] = useState(false)
  const [hover,        setHover]        = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const { format: money, parts } = useCurrency()

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setProfile(DEMO_PROFILE)
        setTransactions(DEMO_TRANSACTIONS)
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: txs }] = await Promise.all([
        supabase.from('profiles').select('full_name, balance, profit, plan, kyc_status').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
      ])

      setProfile(prof)
      setTransactions(txs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const balance  = profile?.balance ?? 0
  const profit   = profile?.profit ?? 0
  const deposited = transactions
    .filter(t => t.type === 'Deposit' && t.status === 'Completed')
    .reduce((s, t) => s + t.amount, 0)
  const profitPct = deposited > 0 ? (profit / deposited) * 100 : 0

  const W = 720, H = 180
  const series = useMemo(() => buildSeries(balance, range), [balance, range])
  const { line, area, pts } = useMemo(() => {
    const min = Math.min(...series), max = Math.max(...series)
    const span = max - min || 1
    const pts = series.map((v, i) => ({
      x: (i / (series.length - 1)) * W,
      y: 14 + ((max - v) / span) * (H - 28),
    }))
    const line = smoothPath(pts)
    return { line, area: `${line} L${W},${H} L0,${H} Z`, pts }
  }, [series])

  function onMove(e: React.MouseEvent) {
    const el = chartRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    setHover(Math.round(ratio * (series.length - 1)))
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Overview" />
        <div className="flex items-center justify-center h-72">
          <Loader2 size={22} className="animate-spin text-brand-primary" />
        </div>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const shown = hover !== null ? series[hover] : balance
  const { symbol, whole, fraction } = parts(shown)
  const hp = hover !== null ? pts[hover] : null

  return (
    <div>
      <TopBar title="Overview" verified={profile?.kyc_status === 'Verified'} />

      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-3xl sm:text-[34px] font-semibold tracking-tight text-dark-base dark:text-white">
              {greeting()}, {firstName}
            </h1>
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/dashboard/deposit"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 h-11 px-5 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus size={16} strokeWidth={2.5} /> Deposit
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 h-11 px-5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 text-dark-base dark:text-white text-sm font-semibold hover:border-black/25 dark:hover:border-white/30 transition"
            >
              <Minus size={16} strokeWidth={2.5} /> Withdraw
            </Link>
          </div>
        </div>

        {/* KYC notice */}
        {!kycDismissed && profile?.kyc_status === 'None' && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3.5">
            <ShieldAlert size={18} className="text-amber-500 flex-shrink-0" />
            <p className="flex-1 text-sm text-dark-base dark:text-white">
              <span className="font-semibold">Verify your identity</span>
              <span className="text-slate-500 dark:text-slate-400"> to unlock withdrawals and higher limits.</span>
            </p>
            <Link href="/dashboard/kyc" className="text-sm font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
              Verify
            </Link>
            <button onClick={() => setKycDismissed(true)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Balance + chart */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#0B0F0D] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute -top-40 -left-24 w-[520px] h-[520px] rounded-full bg-brand-primary/20 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_100%]" />

          <div className="relative p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/55">{hover !== null ? 'Balance at point' : 'Total balance'}</p>
                <p className="mt-2 font-semibold tracking-tight tabular-nums leading-none">
                  <span className="text-white/40 text-3xl sm:text-4xl align-top mr-0.5">{symbol}</span>
                  <span className="text-5xl sm:text-6xl">{whole}</span>
                  {fraction && <span className="text-white/40 text-3xl sm:text-4xl">.{fraction}</span>}
                </p>
                <div className="mt-4 flex items-center gap-2.5 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/15 text-brand-secondary px-2.5 py-1 font-semibold tabular-nums">
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                    {profitPct.toFixed(2)}%
                  </span>
                  <span className="text-white/55 tabular-nums">+{money(profit)} all time</span>
                </div>
              </div>

              <div className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
                {RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 h-8 text-xs font-semibold rounded-full transition ${
                      range === r ? 'bg-white text-dark-base' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={chartRef}
              onMouseMove={onMove}
              onMouseLeave={() => setHover(null)}
              className="relative mt-8 -mx-1 cursor-crosshair"
            >
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[150px] sm:h-[190px] overflow-visible">
                <defs>
                  <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1BE38A" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#1BE38A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#balFill)" />
                <path d={line} fill="none" stroke="#1BE38A" strokeWidth="2.25" vectorEffect="non-scaling-stroke" />
                {hp && (
                  <line x1={hp.x} x2={hp.x} y1={0} y2={H} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
                )}
              </svg>
              {hp && (
                <span
                  className="pointer-events-none absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-brand-secondary ring-4 ring-brand-secondary/25"
                  style={{ left: `${(hp.x / W) * 100}%`, top: `${(hp.y / H) * 100}%` }}
                />
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon={TrendingUp} label="Total profit"    value={`+${money(profit)}`}  hint="Earned across all plans" accent />
          <Stat icon={Wallet}     label="Total deposited" value={money(deposited)} hint="Principal invested" />
          <Link href="/dashboard/plans" className="group">
            <Stat
              icon={Layers}
              label="Active plan"
              value={profile?.plan && profile.plan !== 'None' ? profile.plan : 'No plan'}
              hint={profile?.plan && profile.plan !== 'None' ? 'Manage plan' : 'Choose a plan'}
              link
            />
          </Link>
        </div>

        {/* Activity + markets */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3">
            <CardHead title="Recent activity" href="/dashboard/transactions" />
            {transactions.length === 0 ? (
              <div className="px-6 pb-10 pt-6 text-center">
                <div className="mx-auto w-11 h-11 rounded-full bg-brand-primary/10 grid place-items-center">
                  <Sparkles size={18} className="text-brand-primary" />
                </div>
                <p className="mt-3 text-sm font-medium text-dark-base dark:text-white">No activity yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Make your first deposit to get started.</p>
              </div>
            ) : (
              <ul className="px-2 pb-2">
                {transactions.map(tx => {
                  const out = tx.type === 'Withdrawal'
                  return (
                    <li key={tx.id} className="flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-black/[0.025] dark:hover:bg-white/[0.04] transition">
                      <span className={`w-10 h-10 rounded-full grid place-items-center flex-shrink-0 ${
                        out ? 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300' : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {out ? <ArrowUpRight size={17} /> : <ArrowDownLeft size={17} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-base dark:text-white truncate">{tx.type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {tx.method} · {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-dark-base dark:text-white">
                          {out ? '−' : '+'}{money(tx.amount)}
                        </p>
                        <p className={`text-xs font-medium ${statusTone(tx.status)}`}>{tx.status}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <CardHead title="Markets" />
            <ul className="px-2 pb-2">
              {MARKETS.map(m => {
                const up = m.chg >= 0
                const min = Math.min(...m.spark), max = Math.max(...m.spark)
                const sp = m.spark.map((v, i) => `${(i / (m.spark.length - 1)) * 64},${22 - ((v - min) / (max - min || 1)) * 20}`).join(' ')
                return (
                  <li key={m.sym} className="flex items-center gap-3 px-4 py-3 rounded-2xl">
                    <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center text-[11px] font-bold text-dark-base dark:text-white flex-shrink-0">
                      {m.sym}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-base dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{money(m.price)}</p>
                    </div>
                    <svg viewBox="0 0 64 24" className="w-16 h-6">
                      <polyline points={sp} fill="none" stroke={up ? '#06C167' : '#e11d48'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={`w-14 text-right text-xs font-semibold tabular-nums ${up ? 'text-brand-primary' : 'text-rose-600'}`}>
                      {up ? '+' : ''}{m.chg.toFixed(2)}%
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.07] ${className}`}>
      {children}
    </div>
  )
}

function CardHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-3">
      <h2 className="text-[15px] font-semibold text-dark-base dark:text-white">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-0.5 text-sm font-medium text-slate-500 hover:text-dark-base dark:hover:text-white transition">
          View all <ChevronRight size={15} />
        </Link>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint, accent, link }: {
  icon: React.ElementType
  label: string
  value: string
  hint: string
  accent?: boolean
  link?: boolean
}) {
  return (
    <Card className="p-5 sm:p-6 h-full transition group-hover:ring-black/15 dark:group-hover:ring-white/15">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center">
          <Icon size={16} className={accent ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'} />
        </span>
      </div>
      <p className={`mt-4 text-2xl font-semibold tracking-tight tabular-nums ${accent ? 'text-brand-primary' : 'text-dark-base dark:text-white'}`}>
        {value}
      </p>
      <p className={`mt-1 text-sm inline-flex items-center gap-0.5 ${link ? 'text-dark-base dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
        {hint}{link && <ChevronRight size={15} className="transition group-hover:translate-x-0.5" />}
      </p>
    </Card>
  )
}

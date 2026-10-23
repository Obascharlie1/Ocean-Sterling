'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Users, TrendingUp, Copy as CopyIcon, X, Check, Loader2, Flame, Square, Star } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader, AmountInput } from '@/components/dashboard/ui'
import { Money, CountUp, Reveal, EASE, staggerParent, staggerChild } from '@/components/dashboard/motion'
import { useTraders, useCopyPositions } from '@/lib/tradingStore'
import { positionPnl, RISK_META, type Trader } from '@/lib/trading'
import { useCurrency } from '@/lib/currency'

export default function CopyTradingPage() {
  const { traders, loading } = useTraders()
  const { positions, ready, copy, stop } = useCopyPositions()
  const [picked, setPicked] = useState<Trader | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Live tick for running P/L.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1500)
    return () => clearInterval(id)
  }, [])

  const byId = useMemo(() => Object.fromEntries(traders.map(t => [t.id, t])), [traders])
  const active = positions.filter(p => p.status === 'Active')
  const allocated = active.reduce((s, p) => s + p.amount, 0)
  const totalPnl = active.reduce((s, p) => s + positionPnl(p, byId[p.traderId], now), 0)
  const copiedIds = new Set(active.map(p => p.traderId))

  return (
    <div>
      <TopBar title="Copy Trading" />
      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto space-y-6">
        <PageHeader
          eyebrow="Copy trading"
          title="Mirror the pros, automatically"
          subtitle="Allocate to a trader and every move they make is copied to your account in real time."
        />

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Summary delay={0}    icon={Users}      label="Allocated"   value={<Money usd={allocated} />} />
          <Summary delay={0.05} icon={TrendingUp} label="Live profit" value={<Money usd={totalPnl} sign={totalPnl >= 0 ? '+' : undefined} duration={0.5} />} accent />
          <Summary delay={0.1}  icon={CopyIcon}   label="Copying"     value={<CountUp value={active.length} />} />
        </div>

        {/* Active copies */}
        <AnimatePresence>
          {ready && active.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Reveal>
                <Card>
                  <h2 className="px-6 pt-5 pb-1 text-[15px] font-semibold text-dark-base dark:text-white">Your active copies</h2>
                  <ul className="p-2">
                    {active.map(p => {
                      const t = byId[p.traderId]
                      const pnl = positionPnl(p, t, now)
                      return (
                        <li key={p.id} className="flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-black/[0.025] dark:hover:bg-white/[0.04] transition">
                          <Avatar name={t?.name ?? '—'} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-base dark:text-white truncate">{t?.name ?? 'Trader'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">Allocated <Money usd={p.amount} /></p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold tabular-nums ${pnl >= 0 ? 'text-brand-primary' : 'text-rose-500'}`}>
                              <Money usd={pnl} sign={pnl >= 0 ? '+' : undefined} duration={0.4} />
                            </p>
                            <p className="text-[11px] text-slate-400">live P/L</p>
                          </div>
                          <button
                            onClick={() => stop(p.id)}
                            className="ml-1 inline-flex items-center gap-1.5 h-8 px-3 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:ring-rose-400 hover:text-rose-500 active:scale-95 transition"
                          >
                            <Square size={12} /> Stop
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trader catalog */}
        <div>
          <h2 className="text-[15px] font-semibold text-dark-base dark:text-white mb-3">Top traders</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 size={22} className="animate-spin text-brand-primary" /></div>
          ) : (
            <motion.div variants={staggerParent} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {traders.map(t => (
                <TraderCard key={t.id} trader={t} copied={copiedIds.has(t.id)} onCopy={() => setPicked(t)} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <CopyModal
        trader={picked}
        onClose={() => setPicked(null)}
        onConfirm={(amount) => { if (picked) { copy(picked.id, amount); setPicked(null) } }}
      />
    </div>
  )
}

function Summary({ icon: Icon, label, value, accent, delay }: {
  icon: React.ElementType; label: string; value: React.ReactNode; accent?: boolean; delay: number
}) {
  return (
    <Reveal delay={delay}>
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
          <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center">
            <Icon size={15} className={accent ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'} />
          </span>
        </div>
        <p className={`mt-3 text-2xl font-semibold tracking-tight tabular-nums ${accent ? 'text-brand-primary' : 'text-dark-base dark:text-white'}`}>{value}</p>
      </Card>
    </Reveal>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-[#034d2a] grid place-items-center text-xs font-semibold text-white flex-shrink-0">
      {initials}
    </span>
  )
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 26}`).join(' ')
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={up ? '#06C167' : '#e11d48'} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TraderCard({ trader, copied, onCopy }: { trader: Trader; copied: boolean; onCopy: () => void }) {
  const risk = RISK_META[trader.risk]
  return (
    <motion.div variants={staggerChild} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Card className="p-5 h-full flex flex-col">
        <div className="flex items-start gap-3">
          <Avatar name={trader.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-dark-base dark:text-white truncate">{trader.name}</p>
              {trader.featured && <Star size={13} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{trader.handle}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${risk.cls}`}>{trader.risk}</span>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{trader.strategy}</p>

        <div className="mt-4"><Sparkline data={trader.spark} up={trader.monthly_return >= 0} /></div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric label="Monthly" value={`+${trader.monthly_return}%`} accent />
          <Metric label="Win rate" value={`${trader.win_rate}%`} />
          <Metric label="Copiers" value={trader.followers >= 1000 ? `${(trader.followers / 1000).toFixed(1)}k` : String(trader.followers)} />
        </div>

        <button
          onClick={onCopy}
          className={`mt-5 h-10 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition ${
            copied
              ? 'ring-1 ring-brand-primary/40 text-brand-primary bg-brand-primary/[0.06]'
              : 'bg-dark-base text-white dark:bg-white dark:text-dark-base hover:opacity-90'
          }`}
        >
          {copied ? <><Check size={15} /> Copying — add more</> : <><CopyIcon size={15} /> Copy trader</>}
        </button>
      </Card>
    </motion.div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] py-2">
      <p className={`text-sm font-semibold tabular-nums ${accent ? 'text-brand-primary' : 'text-dark-base dark:text-white'}`}>{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function CopyModal({ trader, onClose, onConfirm }: {
  trader: Trader | null
  onClose: () => void
  onConfirm: (amount: number) => void
}) {
  const [amount, setAmount] = useState('')
  const { convert, formatValue } = useCurrency()
  useEffect(() => { if (trader) setAmount('') }, [trader])
  const amt = parseFloat(amount) || 0
  const projected = amt * (trader?.monthly_return ?? 0) / 100

  return (
    <AnimatePresence>
      {trader && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.08] p-7 shadow-2xl"
          >
            <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 rounded-full grid place-items-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition"><X size={16} /></button>

            <div className="flex items-center gap-3">
              <Avatar name={trader.name} />
              <div>
                <p className="text-[15px] font-semibold text-dark-base dark:text-white">Copy {trader.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{trader.strategy}</p>
              </div>
            </div>

            <p className="mt-6 text-sm font-medium text-dark-base dark:text-white mb-2">Amount to allocate</p>
            <AmountInput value={amount} onChange={setAmount} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[500, 1000, 5000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))} className="h-8 px-3.5 rounded-full ring-1 ring-black/[0.08] dark:ring-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:ring-brand-primary hover:text-brand-primary transition tabular-nums">
                  {formatValue(convert(v), { cents: false })}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-brand-primary/[0.06] px-4 py-3 text-sm">
              <Flame size={15} className="text-brand-primary" />
              <span className="text-slate-600 dark:text-slate-300">Projected first month</span>
              <span className="ml-auto font-semibold tabular-nums text-brand-primary">+{formatValue(convert(projected))}</span>
            </div>

            <button
              onClick={() => onConfirm(amt)}
              disabled={amt <= 0}
              className="mt-6 w-full h-12 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition"
            >
              <CopyIcon size={16} /> Start copying
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

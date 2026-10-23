'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Loader2, Power, Zap, Activity, ShieldCheck, TriangleAlert } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader, AmountInput } from '@/components/dashboard/ui'
import { Money, CountUp, Reveal, EASE } from '@/components/dashboard/motion'
import { useBotConfig, useBotSettings } from '@/lib/tradingStore'
import { botPnl, BOT_RISK_META, type BotRisk } from '@/lib/trading'

const PAIRS = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'XAU/USD', 'SOL/USD', 'GBP/JPY', 'NAS100', 'SPX500']

export default function AIBotPage() {
  const { config, loading } = useBotConfig()
  const { settings, ready, update } = useBotSettings()
  const [amount, setAmount] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => { if (ready) setAmount(settings.allocation ? String(settings.allocation) : '') }, [ready, settings.allocation])
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1500)
    return () => clearInterval(id)
  }, [])

  const on = settings.enabled
  const pnl = botPnl(settings, config, now)
  const amt = parseFloat(amount) || 0
  const belowMin = amt > 0 && amt < config.min_allocation

  // Derived "live" stats from the running clock.
  const uptimeMs = on && settings.startedAt ? now - new Date(settings.startedAt).getTime() : 0
  const trades = on ? Math.floor(uptimeMs / 9000) + 12 : 0
  const feed = useLiveFeed(on, config.win_rate)

  function toggle() {
    if (on) { update({ enabled: false }); return }
    if (amt < config.min_allocation) return
    update({ enabled: true, allocation: amt })
  }

  if (loading || !ready) {
    return (
      <div><TopBar title="AI Bot" /><div className="flex items-center justify-center h-72"><Loader2 size={22} className="animate-spin text-brand-primary" /></div></div>
    )
  }

  if (!config.platform_enabled) {
    return (
      <div>
        <TopBar title="AI Bot" />
        <div className="px-4 sm:px-8 py-10">
          <Reveal>
            <Card className="max-w-lg mx-auto px-8 py-12 text-center">
              <span className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 grid place-items-center"><TriangleAlert size={28} className="text-amber-500" /></span>
              <h2 className="mt-6 text-xl font-semibold text-dark-base dark:text-white">The AI bot is paused</h2>
              <p className="mt-2 text-[15px] text-slate-500 dark:text-slate-400">Our team has temporarily paused automated trading while markets settle. Please check back soon.</p>
            </Card>
          </Reveal>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="AI Bot" />
      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto space-y-6">
        <PageHeader
          eyebrow="AI trading bot"
          title="Let the engine trade for you"
          subtitle="Our AI scans the markets around the clock and executes on your behalf. Set your risk, fund it, and switch it on."
        />

        {/* Status hero */}
        <Reveal delay={0.05}>
          <section className="relative overflow-hidden rounded-[28px] bg-[#0B0F0D] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <motion.div
              className="pointer-events-none absolute -top-40 -right-24 w-[520px] h-[520px] rounded-full blur-[120px]"
              animate={{ backgroundColor: on ? 'rgba(27,227,138,0.22)' : 'rgba(120,120,120,0.12)' }}
              transition={{ duration: 0.8 }}
            />
            <div className="relative p-6 sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <span className="relative w-14 h-14 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 grid place-items-center">
                    <Bot size={26} className={on ? 'text-brand-secondary' : 'text-white/60'} />
                    {on && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-secondary"><span className="absolute inset-0 rounded-full bg-brand-secondary animate-ping" /></span>}
                  </span>
                  <div>
                    <p className="text-sm text-white/55">Bot status</p>
                    <p className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                      {on ? 'Active' : 'Idle'}
                      <span className={`inline-block w-2 h-2 rounded-full ${on ? 'bg-brand-secondary' : 'bg-white/30'}`} />
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggle}
                  disabled={!on && amt < config.min_allocation}
                  className={`inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-semibold active:scale-[0.97] transition disabled:opacity-40 disabled:active:scale-100 ${
                    on ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-brand-primary text-white hover:bg-brand-dim'
                  }`}
                >
                  <Power size={16} /> {on ? 'Switch off' : 'Switch on'}
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/[0.07]">
                <HeroStat label="Allocated"><Money usd={on ? settings.allocation : amt} /></HeroStat>
                <HeroStat label="Live profit"><span className="text-brand-secondary"><Money usd={pnl} sign={pnl >= 0 ? '+' : undefined} duration={0.5} /></span></HeroStat>
                <HeroStat label="Trades today"><CountUp value={trades} /></HeroStat>
                <HeroStat label="Win rate"><CountUp value={config.win_rate} suffix="%" /></HeroStat>
              </div>
            </div>
          </section>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-6">
            <Reveal delay={0.1}>
              <Card className="p-6">
                <h2 className="text-[15px] font-semibold text-dark-base dark:text-white">Risk profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Adjust how boldly the engine trades.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(BOT_RISK_META) as BotRisk[]).map(r => {
                    const sel = settings.risk === r
                    return (
                      <button
                        key={r}
                        onClick={() => update({ risk: r })}
                        className={`text-left rounded-2xl p-4 transition active:scale-[0.98] ${sel ? 'ring-2 ring-brand-primary bg-brand-primary/[0.05]' : 'ring-1 ring-black/[0.08] dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/25'}`}
                      >
                        <p className="text-sm font-semibold text-dark-base dark:text-white">{r}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">{BOT_RISK_META[r].desc}</p>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.15}>
              <Card className="p-6">
                <h2 className="text-[15px] font-semibold text-dark-base dark:text-white">Funding</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
                  Minimum <Money usd={config.min_allocation} cents={false} />. {on && 'Switch the bot off to change this.'}
                </p>
                <div className={on ? 'opacity-50 pointer-events-none' : ''}>
                  <AmountInput value={amount} onChange={setAmount} />
                </div>
                {belowMin && <p className="mt-2 text-sm text-rose-500">Below the <Money usd={config.min_allocation} cents={false} /> minimum.</p>}
              </Card>
            </Reveal>
          </div>

          {/* Live activity */}
          <Reveal delay={0.2} className="lg:col-span-2">
            <Card className="h-full">
              <div className="flex items-center gap-2 px-6 pt-5 pb-3">
                <Activity size={16} className="text-brand-primary" />
                <h2 className="text-[15px] font-semibold text-dark-base dark:text-white">Live activity</h2>
                {on && <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" /> streaming</span>}
              </div>
              {!on ? (
                <div className="px-6 pb-10 pt-4 text-center">
                  <div className="mx-auto w-11 h-11 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center"><Zap size={18} className="text-slate-400" /></div>
                  <p className="mt-3 text-sm font-medium text-dark-base dark:text-white">Bot is off</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fund and switch it on to see live trades.</p>
                </div>
              ) : (
                <ul className="px-2 pb-3">
                  <AnimatePresence initial={false}>
                    {feed.map(f => (
                      <motion.li
                        key={f.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <span className={`w-7 h-7 rounded-full grid place-items-center flex-shrink-0 text-[11px] font-bold ${f.win ? 'bg-brand-primary/10 text-brand-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                          {f.side === 'BUY' ? '↗' : '↘'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-base dark:text-white">{f.side} {f.pair}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{f.ago}</p>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${f.win ? 'text-brand-primary' : 'text-rose-500'}`}>
                          {f.win ? '+' : '−'}<Money usd={f.amt} />
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </Card>
          </Reveal>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={14} className="text-brand-primary flex-shrink-0" />
          <span>The bot only trades the balance you allocate. Switch it off any time — your funds stay in your account.</span>
        </div>
      </div>
    </div>
  )
}

function HeroStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0B0F0D] px-5 py-4">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-lg sm:text-xl font-semibold tracking-tight tabular-nums">{children}</p>
    </div>
  )
}

interface Trade { id: string; side: 'BUY' | 'SELL'; pair: string; amt: number; win: boolean; ago: string }

// Emits a new simulated trade every few seconds while the bot is on.
function useLiveFeed(on: boolean, winRate: number): Trade[] {
  const [feed, setFeed] = useState<Trade[]>([])

  useEffect(() => {
    if (!on) { setFeed([]); return }
    const seed = Math.floor(Math.random() * 1000)
    let i = 0
    const make = (): Trade => {
      i++
      const r = Math.sin(seed + i * 2.3)
      return {
        id: `t-${Date.now()}-${i}`,
        side: r > 0 ? 'BUY' : 'SELL',
        pair: PAIRS[Math.abs(Math.floor(r * 1000)) % PAIRS.length],
        amt: 20 + Math.abs(r) * 180,
        win: Math.abs(Math.sin(seed * 1.7 + i)) * 100 < winRate,
        ago: 'just now',
      }
    }
    setFeed(Array.from({ length: 5 }, make).reverse())
    const id = setInterval(() => setFeed(prev => [make(), ...prev].slice(0, 7)), 3500)
    return () => clearInterval(id)
  }, [on, winRate])

  return feed
}

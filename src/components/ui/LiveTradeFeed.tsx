'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type EventKind = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW'

interface RawEvent {
  kind: EventKind
  sym?: string
  qty?: number
  price?: number
  amount?: number
  loc: string
}

const EVENTS: RawEvent[] = [
  { kind: 'BUY',      sym: 'AAPL',  qty: 150,  price: 218.45,  loc: 'New York' },
  { kind: 'DEPOSIT',  amount: 25000,                            loc: 'San Francisco' },
  { kind: 'SELL',     sym: 'NVDA',  qty: 10,   price: 892.17,  loc: 'London' },
  { kind: 'BUY',      sym: 'BTC',   qty: 2,    price: 71420,   loc: 'Singapore' },
  { kind: 'WITHDRAW', amount: 8500,                             loc: 'London' },
  { kind: 'BUY',      sym: 'SPY',   qty: 500,  price: 584.23,  loc: 'Chicago' },
  { kind: 'DEPOSIT',  amount: 50000,                            loc: 'Zurich' },
  { kind: 'SELL',     sym: 'TSLA',  qty: 25,   price: 245.80,  loc: 'Dubai' },
  { kind: 'BUY',      sym: 'MSFT',  qty: 50,   price: 415.20,  loc: 'Tokyo' },
  { kind: 'WITHDRAW', amount: 12000,                            loc: 'Sydney' },
  { kind: 'SELL',     sym: 'AAPL',  qty: 100,  price: 219.10,  loc: 'Frankfurt' },
  { kind: 'BUY',      sym: 'ETH',   qty: 5,    price: 3821.50, loc: 'Hong Kong' },
  { kind: 'DEPOSIT',  amount: 10000,                            loc: 'Toronto' },
  { kind: 'BUY',      sym: 'AMZN',  qty: 200,  price: 198.45,  loc: 'Miami' },
  { kind: 'SELL',     sym: 'NVDA',  qty: 30,   price: 895.40,  loc: 'Sydney' },
  { kind: 'BUY',      sym: 'TSMC',  qty: 1000, price: 168.30,  loc: 'Seoul' },
  { kind: 'WITHDRAW', amount: 5000,                             loc: 'Paris' },
  { kind: 'SELL',     sym: 'META',  qty: 75,   price: 527.80,  loc: 'Paris' },
  { kind: 'BUY',      sym: 'GOOGL', qty: 250,  price: 175.30,  loc: 'Austin' },
  { kind: 'DEPOSIT',  amount: 75000,                            loc: 'New York' },
  { kind: 'SELL',     sym: 'AMZN',  qty: 60,   price: 197.80,  loc: 'Seattle' },
  { kind: 'BUY',      sym: 'META',  qty: 80,   price: 525.40,  loc: 'Berlin' },
]

interface LiveEvent extends RawEvent { id: number }

let idCounter = 0

function fmt(ev: RawEvent): string {
  if (ev.kind === 'BUY' || ev.kind === 'SELL') {
    const total = ev.qty! * ev.price!
    if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(2)}M`
    if (total >= 1_000)     return `$${(total / 1_000).toFixed(1)}k`
    return `$${total.toFixed(0)}`
  }
  const n = ev.amount!
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

const KIND_CONFIG: Record<EventKind, { accent: string; label: string }> = {
  BUY:      { accent: 'text-brand-primary',   label: 'Buy' },
  SELL:     { accent: 'text-slate-300', label: 'Sell' },
  DEPOSIT:  { accent: 'text-white',     label: 'Deposit' },
  WITHDRAW: { accent: 'text-slate-400', label: 'Withdraw' },
}

function TradeCard({ ev }: { ev: LiveEvent }) {
  const cfg = KIND_CONFIG[ev.kind]
  const isTrade = ev.kind === 'BUY' || ev.kind === 'SELL'
  const main = isTrade ? ev.sym! : fmt(ev)
  const sub = isTrade ? fmt(ev) : ev.loc

  return (
    <div className="w-[150px] sm:w-[168px] bg-black/55 backdrop-blur-md rounded-2xl overflow-hidden px-3 py-2.5">
      <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${cfg.accent}`}>{cfg.label}</p>
      <p className="text-sm font-bold text-white leading-none">{main}</p>
      <p className="text-[10px] text-white/50 mt-0.5">{sub}</p>
    </div>
  )
}

export function LiveTradeFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const indexRef = useRef(Math.floor(Math.random() * EVENTS.length))

  useEffect(() => {
    const add = () => {
      const raw = EVENTS[indexRef.current % EVENTS.length]
      indexRef.current++
      const entry: LiveEvent = { ...raw, id: ++idCounter }
      setEvents(prev => [...prev.slice(-2), entry])
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== entry.id))
      }, 5000)
    }

    const first = setTimeout(add, 1000)
    const interval = setInterval(add, 2600)
    return () => { clearTimeout(first); clearInterval(interval) }
  }, [])

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 flex flex-col gap-1.5 pointer-events-none">
      <AnimatePresence>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: 24, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <TradeCard ev={ev} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

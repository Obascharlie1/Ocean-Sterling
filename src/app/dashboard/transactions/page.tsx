'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Loader2, ArrowDownLeft, ArrowUpRight, TrendingUp, Clock, ChevronDown, Inbox } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { Money, CountUp, Reveal, staggerParent, staggerChild } from '@/components/dashboard/motion'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, DEMO_TRANSACTIONS } from '@/lib/demo'

interface Tx {
  id: string
  type: string
  amount: number
  method: string
  status: string
  created_at: string
  note?: string | null
}

const FILTERS = ['All', 'Deposits', 'Withdrawals', 'Profit'] as const
type FilterKey = (typeof FILTERS)[number]

function statusTone(status: string) {
  if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  if (status === 'Pending')   return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
  if (status === 'Rejected')  return 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState<FilterKey>('All')
  const [open,         setOpen]         = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setTransactions(DEMO_TRANSACTIONS)
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setTransactions(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => transactions.filter(tx => {
    const matchesType =
      filter === 'All' ||
      (filter === 'Deposits'    && tx.type === 'Deposit')    ||
      (filter === 'Withdrawals' && tx.type === 'Withdrawal') ||
      (filter === 'Profit'      && tx.type === 'Profit')
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      tx.method.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q) ||
      (tx.note ?? '').toLowerCase().includes(q)
    return matchesType && matchesSearch
  }), [transactions, filter, search])

  const groups = useMemo(() => {
    const out: { label: string; items: Tx[] }[] = []
    filtered.forEach(tx => {
      const label = monthLabel(tx.created_at)
      const last = out[out.length - 1]
      if (last?.label === label) last.items.push(tx)
      else out.push({ label, items: [tx] })
    })
    return out
  }, [filtered])

  const completed = transactions.filter(t => t.status === 'Completed')
  const totalIn   = completed.filter(t => t.type === 'Deposit').reduce((s, t) => s + t.amount, 0)
  const totalOut  = completed.filter(t => t.type === 'Withdrawal').reduce((s, t) => s + t.amount, 0)
  const earned    = completed.filter(t => t.type === 'Profit').reduce((s, t) => s + t.amount, 0)
  const pending   = transactions.filter(t => t.status === 'Pending').length

  return (
    <div>
      <TopBar title="Transactions" />

      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto">
        <PageHeader eyebrow="History" title="Transactions" subtitle="Every deposit, withdrawal and payout on your account." />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={22} className="animate-spin text-brand-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Totals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Total delay={0}    icon={ArrowDownLeft} label="Money in"  value={<Money usd={totalIn} />} />
              <Total delay={0.05} icon={ArrowUpRight}  label="Money out" value={<Money usd={totalOut} />} />
              <Total delay={0.1}  icon={TrendingUp}    label="Earned"    value={<Money usd={earned} sign="+" />} accent />
              <Total delay={0.15} icon={Clock}         label="Pending"   value={<CountUp value={pending} />} />
            </div>

            <Reveal delay={0.15}>
              <Card>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.07]">
                  <div className="flex rounded-full bg-black/[0.04] dark:bg-white/[0.06] p-1 overflow-x-auto">
                    {FILTERS.map(f => (
                      <button
                        key={f}
                        onClick={() => { setFilter(f); setOpen(null) }}
                        className={`relative px-3.5 h-8 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                          filter === f ? 'text-white dark:text-dark-base' : 'text-slate-500 dark:text-slate-400 hover:text-dark-base dark:hover:text-white'
                        }`}
                      >
                        {filter === f && (
                          <motion.span layoutId="tx-filter" className="absolute inset-0 rounded-full bg-dark-base dark:bg-white" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                        )}
                        <span className="relative">{f}</span>
                      </button>
                    ))}
                  </div>
                  <div className="relative sm:ml-auto">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search method, note or ID"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="h-10 w-full sm:w-72 rounded-full bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.08] pl-10 pr-4 text-sm text-dark-base dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center">
                      <Inbox size={19} className="text-slate-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-dark-base dark:text-white">
                      {transactions.length === 0 ? 'No transactions yet' : 'Nothing matches'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {transactions.length === 0 ? 'Your activity will show up here.' : 'Try a different filter or search.'}
                    </p>
                  </div>
                ) : (
                  <motion.div key={filter + search} variants={staggerParent} initial="hidden" animate="show" className="p-2 sm:p-3">
                    {groups.map(g => (
                      <div key={g.label} className="mb-2 last:mb-0">
                        <motion.p variants={staggerChild} className="px-4 pt-3 pb-2 text-xs font-semibold text-slate-400">{g.label}</motion.p>
                        <ul>
                          {g.items.map(tx => (
                            <Row key={tx.id} tx={tx} open={open === tx.id} onToggle={() => setOpen(o => (o === tx.id ? null : tx.id))} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  )
}

function Total({ icon: Icon, label, value, accent, delay }: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  accent?: boolean
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <Card className="p-5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
          <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center">
            <Icon size={15} className={accent ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'} />
          </span>
        </div>
        <p className={`mt-3 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums truncate ${accent ? 'text-brand-primary' : 'text-dark-base dark:text-white'}`}>
          {value}
        </p>
      </Card>
    </Reveal>
  )
}

function Row({ tx, open, onToggle }: { tx: Tx; open: boolean; onToggle: () => void }) {
  const out = tx.type === 'Withdrawal'
  const date = new Date(tx.created_at)
  return (
    <motion.li variants={staggerChild} className={`rounded-2xl transition-colors ${open ? 'bg-black/[0.03] dark:bg-white/[0.04]' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.04]'}`}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3.5 px-4 py-3 text-left">
        <span className={`w-10 h-10 rounded-full grid place-items-center flex-shrink-0 ${
          out ? 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300' : 'bg-brand-primary/10 text-brand-primary'
        }`}>
          {out ? <ArrowUpRight size={17} /> : tx.type === 'Profit' ? <TrendingUp size={17} /> : <ArrowDownLeft size={17} />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-base dark:text-white truncate">{tx.type}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {tx.method} · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusTone(tx.status)}`}>{tx.status}</span>
        <div className="text-right w-28 sm:w-32">
          <p className={`text-sm font-semibold tabular-nums ${tx.status === 'Rejected' ? 'text-slate-400 line-through' : 'text-dark-base dark:text-white'}`}>
            <Money usd={tx.amount} sign={out ? '−' : '+'} duration={0.6} />
          </p>
          <p className={`sm:hidden text-xs font-medium ${statusTone(tx.status).split(' ').slice(1).join(' ')}`}>{tx.status}</p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 sm:pl-[70px] pb-4 pt-1 text-sm">
              <Detail label="Reference" value={tx.id.slice(0, 12).toUpperCase()} mono />
              <Detail label="Date & time" value={date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} />
              <Detail label="Method" value={tx.method} />
              <Detail label="Note" value={tx.note || '—'} />
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-dark-base dark:text-white truncate ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</dd>
    </div>
  )
}

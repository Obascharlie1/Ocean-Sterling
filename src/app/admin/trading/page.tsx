'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Check, Star, Power, Bot, Copy as CopyIcon } from 'lucide-react'
import type { Trader, BotConfig, RiskLevel } from '@/lib/trading'
import { generateTrader } from '@/lib/trading'

const inputCls = 'w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-base dark:bg-dark-card text-sm text-dark-base dark:text-white focus:outline-none focus:border-brand-primary transition-colors rounded-lg'
const RISKS: RiskLevel[] = ['Low', 'Medium', 'High']

export default function AdminTradingPage() {
  const [traders, setTraders] = useState<Trader[]>([])
  const [config,  setConfig]  = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice,  setNotice]  = useState('')

  async function load() {
    const [tr, cf] = await Promise.all([
      fetch('/api/admin/copy-traders').then(r => r.json()),
      fetch('/api/admin/ai-bot-config').then(r => r.json()),
    ])
    setTraders(tr.data ?? [])
    setConfig(cf)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function flash(msg: string) { setNotice(msg); setTimeout(() => setNotice(''), 2600) }

  async function patchTrader(id: string, patch: Partial<Trader>) {
    // Optimistic — reverts on failure (e.g. demo mode).
    const prev = traders
    setTraders(t => t.map(x => x.id === id ? { ...x, ...patch } : x))
    const res = await fetch(`/api/admin/copy-traders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    })
    if (!res.ok) { setTraders(prev); flash((await res.json()).error ?? 'Could not save.') }
  }

  async function removeTrader(id: string) {
    const prev = traders
    setTraders(t => t.filter(x => x.id !== id))
    const res = await fetch(`/api/admin/copy-traders/${id}`, { method: 'DELETE' })
    if (!res.ok) { setTraders(prev); flash((await res.json()).error ?? 'Could not delete.') }
  }

  async function addTrader() {
    const t = generateTrader()
    setTraders(prev => [...prev, t]) // optimistic — shows the generated trader immediately
    const { id: _id, ...body } = t
    void _id
    const res = await fetch('/api/admin/copy-traders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) {
      const { data } = await res.json()
      setTraders(prev => prev.map(x => (x.id === t.id ? data : x)))
    } else {
      flash((await res.json()).error ?? 'Demo mode — not saved.')
    }
  }

  async function saveConfig(patch: Partial<BotConfig>) {
    if (!config) return
    const next = { ...config, ...patch }
    setConfig(next)
    const res = await fetch('/api/admin/ai-bot-config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
    })
    flash(res.ok ? 'Saved.' : (await res.json()).error ?? 'Could not save.')
  }

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-brand-primary" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-base dark:text-white">Trading</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage copy-trading traders and the AI bot.</p>
        </div>
        {notice && <span className="text-xs font-semibold px-3 py-1.5 bg-amber-400/15 text-amber-700 dark:text-amber-400 rounded">{notice}</span>}
      </div>

      {/* AI bot config */}
      {config && (
        <section className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
          <div className="px-5 py-4 border-b border-light-border dark:border-dark-border flex items-center gap-2">
            <Bot size={15} className="text-brand-primary" />
            <h2 className="text-sm font-bold text-dark-base dark:text-white">AI Trading Bot</h2>
            <button
              onClick={() => saveConfig({ platform_enabled: !config.platform_enabled })}
              className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                config.platform_enabled ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 dark:bg-dark-surface text-slate-500'
              }`}
            >
              <Power size={13} /> {config.platform_enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Num label="Minimum allocation ($)" value={config.min_allocation} onSave={v => saveConfig({ min_allocation: v })} />
            <Num label="Win rate (%)" value={config.win_rate} onSave={v => saveConfig({ win_rate: v })} />
            <Num label="Daily return min (%)" step="0.1" value={config.daily_return_min} onSave={v => saveConfig({ daily_return_min: v })} />
            <Num label="Daily return max (%)" step="0.1" value={config.daily_return_max} onSave={v => saveConfig({ daily_return_max: v })} />
          </div>
          <p className="px-5 pb-4 text-[11px] text-slate-400">These values drive the simulated performance users see. Disabling the bot shows a “paused” screen to every user.</p>
        </section>
      )}

      {/* Traders */}
      <section className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
        <div className="px-5 py-4 border-b border-light-border dark:border-dark-border flex items-center gap-2">
          <CopyIcon size={15} className="text-brand-primary" />
          <h2 className="text-sm font-bold text-dark-base dark:text-white">Copy-Trading Traders</h2>
          <span className="text-xs text-slate-500">{traders.length}</span>
          <button onClick={addTrader} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-dim transition-colors">
            <Plus size={13} /> Add trader
          </button>
        </div>
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {traders.map(t => (
            <div key={t.id} className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Text label="Name" value={t.name} onSave={v => patchTrader(t.id, { name: v })} />
                <Text label="Handle" value={t.handle} onSave={v => patchTrader(t.id, { handle: v })} />
                <Text label="Strategy" value={t.strategy} onSave={v => patchTrader(t.id, { strategy: v })} wide />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk</label>
                  <select value={t.risk} onChange={e => patchTrader(t.id, { risk: e.target.value as RiskLevel })} className={inputCls}>
                    {RISKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <NumInline label="Monthly %" value={t.monthly_return} onSave={v => patchTrader(t.id, { monthly_return: v })} />
                <NumInline label="Win %" value={t.win_rate} onSave={v => patchTrader(t.id, { win_rate: v })} />
                <NumInline label="Followers" value={t.followers} onSave={v => patchTrader(t.id, { followers: v })} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Toggle on={t.is_active} label="Active"   icon={Check} onClick={() => patchTrader(t.id, { is_active: !t.is_active })} />
                <Toggle on={t.featured}  label="Featured" icon={Star}  onClick={() => patchTrader(t.id, { featured: !t.featured })} />
                <button onClick={() => removeTrader(t.id)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border text-xs font-semibold text-slate-500 hover:border-rose-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Toggle({ on, label, icon: Icon, onClick }: { on: boolean; label: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      on ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 dark:bg-dark-surface text-slate-500'
    }`}>
      <Icon size={13} /> {label}{on ? ' ✓' : ''}
    </button>
  )
}

function Text({ label, value, onSave, wide }: { label: string; value: string; onSave: (v: string) => void; wide?: boolean }) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input value={v} onChange={e => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} className={inputCls} />
    </div>
  )
}

function NumInline({ label, value, onSave }: { label: string; value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value))
  useEffect(() => setV(String(value)), [value])
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input type="number" value={v} onChange={e => setV(e.target.value)} onBlur={() => { const n = parseFloat(v); if (!isNaN(n) && n !== value) onSave(n) }} className={inputCls} />
    </div>
  )
}

function Num({ label, value, onSave, step }: { label: string; value: number; onSave: (v: number) => void; step?: string }) {
  const [v, setV] = useState(String(value))
  useEffect(() => setV(String(value)), [value])
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input type="number" step={step} value={v} onChange={e => setV(e.target.value)} onBlur={() => { const n = parseFloat(v); if (!isNaN(n) && n !== value) onSave(n) }} className={inputCls} />
    </div>
  )
}

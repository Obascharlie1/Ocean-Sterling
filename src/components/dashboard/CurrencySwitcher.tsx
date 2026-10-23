'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { CURRENCIES, useCurrency } from '@/lib/currency'

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Display currency: ${currency.code}`}
        className="h-8 px-2 flex items-center gap-1 border border-light-border dark:border-dark-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-colors"
      >
        <span className="text-sm leading-none">{currency.flag}</span>
        {currency.code}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-60 bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
          <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Display currency
          </p>
          <ul role="listbox" aria-label="Display currency" className="pb-1.5 max-h-80 overflow-y-auto">
            {CURRENCIES.map(c => {
              const active = c.code === currency.code
              return (
                <li key={c.code}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => { setCurrency(c.code); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-brand-primary/[0.06] text-dark-base dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 min-w-0">
                      <span className="font-semibold">{c.code}</span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{c.name}</span>
                    </span>
                    {active && <Check size={14} className="text-brand-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="px-4 py-2.5 border-t border-light-border dark:border-dark-border text-[11px] leading-snug text-slate-400">
            Amounts are held in USD and converted at reference rates for display.
          </p>
        </div>
      )}
    </div>
  )
}

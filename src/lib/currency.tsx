'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/*
 * Display-currency layer for the dashboard. Balances and transactions are
 * stored in USD; this only changes how they're shown. Rates are fixed
 * reference rates (USD → X) — swap in a live feed if one is ever needed.
 */

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸', rate: 1 },
  { code: 'EUR', name: 'Euro',              flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound',     flag: '🇬🇧', rate: 0.79 },
  { code: 'CAD', name: 'Canadian Dollar',   flag: '🇨🇦', rate: 1.37 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.52 },
  { code: 'CHF', name: 'Swiss Franc',       flag: '🇨🇭', rate: 0.88 },
  { code: 'JPY', name: 'Japanese Yen',      flag: '🇯🇵', rate: 151.4 },
  { code: 'NGN', name: 'Nigerian Naira',    flag: '🇳🇬', rate: 1580 },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

const STORAGE_KEY = 'dashboard-currency'

interface CurrencyContextValue {
  currency: (typeof CURRENCIES)[number]
  setCurrency: (code: CurrencyCode) => void
  /** Convert a USD amount into the selected currency. */
  convert: (usd: number) => number
  /** Format a USD amount in the selected currency, e.g. "€1,234.50". */
  format: (usd: number, opts?: { cents?: boolean }) => string
  /** Same as format, split into symbol / whole / fraction for big-number layouts. */
  parts: (usd: number) => { symbol: string; whole: string; fraction: string }
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function formatter(code: CurrencyCode, cents: boolean) {
  // JPY etc. have no minor unit; let Intl decide unless cents are suppressed.
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    ...(cents ? {} : { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  })
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>('USD')

  // Read the saved choice after mount so server and client render the same markup.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && CURRENCIES.some(c => c.code === saved)) setCode(saved as CurrencyCode)
    } catch { /* storage unavailable */ }
  }, [])

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCode(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* storage unavailable */ }
  }, [])

  const currency = CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
  const convert = (usd: number) => usd * currency.rate
  const format = (usd: number, { cents = true } = {}) => formatter(code, cents).format(convert(usd))
  const parts = (usd: number) => {
    const p = formatter(code, true).formatToParts(convert(usd))
    return {
      symbol:   p.filter(x => x.type === 'currency').map(x => x.value).join(''),
      whole:    p.filter(x => x.type === 'integer' || x.type === 'group').map(x => x.value).join(''),
      fraction: p.filter(x => x.type === 'fraction').map(x => x.value).join(''),
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, parts }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}

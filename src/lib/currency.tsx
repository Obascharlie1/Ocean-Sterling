'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

/*
 * Display-currency layer for the dashboard. Balances and transactions are
 * stored in USD; this only changes how they're shown. Rates are fixed
 * reference rates (USD → X) — swap in a live feed if one is ever needed.
 */

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',             flag: '🇺🇸', rate: 1 },
  { code: 'EUR', name: 'Euro',                  flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound',         flag: '🇬🇧', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen',          flag: '🇯🇵', rate: 151.4 },
  { code: 'CHF', name: 'Swiss Franc',           flag: '🇨🇭', rate: 0.88 },
  { code: 'CAD', name: 'Canadian Dollar',       flag: '🇨🇦', rate: 1.37 },
  { code: 'AUD', name: 'Australian Dollar',     flag: '🇦🇺', rate: 1.52 },
  { code: 'NZD', name: 'New Zealand Dollar',    flag: '🇳🇿', rate: 1.66 },
  { code: 'CNY', name: 'Chinese Yuan',          flag: '🇨🇳', rate: 7.24 },
  { code: 'HKD', name: 'Hong Kong Dollar',      flag: '🇭🇰', rate: 7.82 },
  { code: 'SGD', name: 'Singapore Dollar',      flag: '🇸🇬', rate: 1.35 },
  { code: 'INR', name: 'Indian Rupee',          flag: '🇮🇳', rate: 83.3 },
  { code: 'AED', name: 'UAE Dirham',            flag: '🇦🇪', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal',           flag: '🇸🇦', rate: 3.75 },
  { code: 'QAR', name: 'Qatari Riyal',          flag: '🇶🇦', rate: 3.64 },
  { code: 'KWD', name: 'Kuwaiti Dinar',         flag: '🇰🇼', rate: 0.31 },
  { code: 'BHD', name: 'Bahraini Dinar',        flag: '🇧🇭', rate: 0.38 },
  { code: 'OMR', name: 'Omani Rial',            flag: '🇴🇲', rate: 0.38 },
  { code: 'JOD', name: 'Jordanian Dinar',       flag: '🇯🇴', rate: 0.71 },
  { code: 'ILS', name: 'Israeli Shekel',        flag: '🇮🇱', rate: 3.72 },
  { code: 'TRY', name: 'Turkish Lira',          flag: '🇹🇷', rate: 32.3 },
  { code: 'RUB', name: 'Russian Ruble',         flag: '🇷🇺', rate: 92.5 },
  { code: 'UAH', name: 'Ukrainian Hryvnia',     flag: '🇺🇦', rate: 39.5 },
  { code: 'PLN', name: 'Polish Zloty',          flag: '🇵🇱', rate: 3.97 },
  { code: 'CZK', name: 'Czech Koruna',          flag: '🇨🇿', rate: 23.2 },
  { code: 'HUF', name: 'Hungarian Forint',      flag: '🇭🇺', rate: 360 },
  { code: 'RON', name: 'Romanian Leu',          flag: '🇷🇴', rate: 4.57 },
  { code: 'SEK', name: 'Swedish Krona',         flag: '🇸🇪', rate: 10.5 },
  { code: 'NOK', name: 'Norwegian Krone',       flag: '🇳🇴', rate: 10.7 },
  { code: 'DKK', name: 'Danish Krone',          flag: '🇩🇰', rate: 6.87 },
  { code: 'ISK', name: 'Icelandic Króna',       flag: '🇮🇸', rate: 138 },
  { code: 'ZAR', name: 'South African Rand',    flag: '🇿🇦', rate: 18.7 },
  { code: 'NGN', name: 'Nigerian Naira',        flag: '🇳🇬', rate: 1580 },
  { code: 'GHS', name: 'Ghanaian Cedi',         flag: '🇬🇭', rate: 15.3 },
  { code: 'KES', name: 'Kenyan Shilling',       flag: '🇰🇪', rate: 129 },
  { code: 'UGX', name: 'Ugandan Shilling',      flag: '🇺🇬', rate: 3800 },
  { code: 'TZS', name: 'Tanzanian Shilling',    flag: '🇹🇿', rate: 2600 },
  { code: 'EGP', name: 'Egyptian Pound',        flag: '🇪🇬', rate: 48.5 },
  { code: 'MAD', name: 'Moroccan Dirham',       flag: '🇲🇦', rate: 9.9 },
  { code: 'DZD', name: 'Algerian Dinar',        flag: '🇩🇿', rate: 134 },
  { code: 'XOF', name: 'West African CFA Franc', flag: '🇸🇳', rate: 603 },
  { code: 'XAF', name: 'Central African CFA Franc', flag: '🇨🇲', rate: 603 },
  { code: 'ETB', name: 'Ethiopian Birr',        flag: '🇪🇹', rate: 57 },
  { code: 'BRL', name: 'Brazilian Real',        flag: '🇧🇷', rate: 5.1 },
  { code: 'MXN', name: 'Mexican Peso',          flag: '🇲🇽', rate: 17.1 },
  { code: 'ARS', name: 'Argentine Peso',        flag: '🇦🇷', rate: 870 },
  { code: 'CLP', name: 'Chilean Peso',          flag: '🇨🇱', rate: 930 },
  { code: 'COP', name: 'Colombian Peso',        flag: '🇨🇴', rate: 3900 },
  { code: 'PEN', name: 'Peruvian Sol',          flag: '🇵🇪', rate: 3.75 },
  { code: 'UYU', name: 'Uruguayan Peso',        flag: '🇺🇾', rate: 39 },
  { code: 'KRW', name: 'South Korean Won',      flag: '🇰🇷', rate: 1355 },
  { code: 'TWD', name: 'New Taiwan Dollar',     flag: '🇹🇼', rate: 32 },
  { code: 'THB', name: 'Thai Baht',             flag: '🇹🇭', rate: 36 },
  { code: 'MYR', name: 'Malaysian Ringgit',     flag: '🇲🇾', rate: 4.7 },
  { code: 'IDR', name: 'Indonesian Rupiah',     flag: '🇮🇩', rate: 15800 },
  { code: 'PHP', name: 'Philippine Peso',       flag: '🇵🇭', rate: 57 },
  { code: 'VND', name: 'Vietnamese Dong',       flag: '🇻🇳', rate: 24800 },
  { code: 'PKR', name: 'Pakistani Rupee',       flag: '🇵🇰', rate: 278 },
  { code: 'BDT', name: 'Bangladeshi Taka',      flag: '🇧🇩', rate: 110 },
  { code: 'LKR', name: 'Sri Lankan Rupee',      flag: '🇱🇰', rate: 300 },
  { code: 'NPR', name: 'Nepalese Rupee',        flag: '🇳🇵', rate: 133 },
  { code: 'KZT', name: 'Kazakhstani Tenge',     flag: '🇰🇿', rate: 450 },
  { code: 'MMK', name: 'Myanmar Kyat',          flag: '🇲🇲', rate: 2100 },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

const STORAGE_KEY = 'dashboard-currency'
const CHANGE_EVENT = 'dashboard-currency-change'

// The saved choice lives in localStorage; the server (and first client render) always sees USD.
function readSaved(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && CURRENCIES.some(c => c.code === saved)) return saved as CurrencyCode
  } catch { /* storage unavailable */ }
  return 'USD'
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

interface CurrencyContextValue {
  currency: (typeof CURRENCIES)[number]
  setCurrency: (code: CurrencyCode) => void
  /** Convert a USD amount into the selected currency. */
  convert: (usd: number) => number
  /** Format a USD amount in the selected currency, e.g. "€1,234.50". */
  format: (usd: number, opts?: { cents?: boolean }) => string
  /** Same as format, split into symbol / whole / fraction for big-number layouts. */
  parts: (usd: number) => { symbol: string; whole: string; fraction: string }
  /** Format / split an amount that's already in the selected currency (e.g. an animated value). */
  formatValue: (value: number, opts?: { cents?: boolean }) => string
  partsValue: (value: number) => { symbol: string; whole: string; fraction: string }
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
  const code = useSyncExternalStore(subscribe, readSaved, () => 'USD' as CurrencyCode)

  const setCurrency = useCallback((next: CurrencyCode) => {
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const currency = CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
  const convert = (usd: number) => usd * currency.rate
  const formatValue = (value: number, { cents = true } = {}) => formatter(code, cents).format(value)
  const partsValue = (value: number) => {
    const p = formatter(code, true).formatToParts(value)
    return {
      symbol:   p.filter(x => x.type === 'currency').map(x => x.value).join(''),
      whole:    p.filter(x => x.type === 'integer' || x.type === 'group').map(x => x.value).join(''),
      fraction: p.filter(x => x.type === 'fraction').map(x => x.value).join(''),
    }
  }
  const format = (usd: number, opts?: { cents?: boolean }) => formatValue(convert(usd), opts)
  const parts = (usd: number) => partsValue(convert(usd))

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, parts, formatValue, partsValue }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}

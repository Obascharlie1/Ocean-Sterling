'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

const timeRanges = ['1D', '1W', '1M', '3M', '1Y'] as const
type Range = typeof timeRanges[number]

const rangeToDays: Record<Range, string> = {
  '1D': '1', '1W': '7', '1M': '30', '3M': '90', '1Y': '365',
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

const VW      = 1200
const VH      = 300
const PAD_L   = 72
const PAD_R   = 88
const PAD_T   = 24
const PAD_B   = 36

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function AreaChart({
  candles,
  isUp,
  gradId,
}: {
  candles: Candle[]
  isUp: boolean
  gradId: string
}) {
  if (candles.length < 2) return null

  const prices  = candles.map(c => c.close)
  const minP    = Math.min(...prices)
  const maxP    = Math.max(...prices)
  const rangeP  = maxP - minP || 1
  const chartW  = VW - PAD_L - PAD_R
  const chartH  = VH - PAD_T - PAD_B
  const color   = isUp ? '#10B981' : '#EF4444'

  const toX = (i: number) => PAD_L + (i / (candles.length - 1)) * chartW
  const toY = (p: number) => PAD_T + ((maxP - p) / rangeP) * chartH

  // Smooth monotone-ish cubic bezier path
  const pts = candles.map((c, i) => ({ x: toX(i), y: toY(c.close) }))
  let linePath = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]
    const c = pts[i]
    const cpX = (p.x + c.x) / 2
    linePath += ` C ${cpX.toFixed(2)} ${p.y.toFixed(2)}, ${cpX.toFixed(2)} ${c.y.toFixed(2)}, ${c.x.toFixed(2)} ${c.y.toFixed(2)}`
  }

  const last      = pts[pts.length - 1]
  const baseY     = PAD_T + chartH
  const areaPath  = `${linePath} L ${last.x.toFixed(2)} ${baseY} L ${pts[0].x.toFixed(2)} ${baseY} Z`
  const currentY  = last.y
  const currentP  = prices[prices.length - 1]

  // 4 horizontal price grid levels
  const levels = [0, 0.33, 0.66, 1].map(f => ({
    price: maxP - f * rangeP,
    y: PAD_T + f * chartH,
  }))

  // 5 time labels evenly spread
  const timeLabels = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const idx = Math.round(f * (candles.length - 1))
    const d = new Date(candles[idx].time)
    return {
      x: toX(idx),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  })

  const tagH = 20
  const tagW = PAD_R - 6
  const tagX = VW - PAD_R + 4

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full block"
      style={{ height: VH }}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Area gradient */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        {/* Glow filter for the line */}
        <filter id={`${gradId}-glow`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      {levels.map(({ y }, i) => (
        <line
          key={i}
          x1={PAD_L} y1={y}
          x2={VW - PAD_R} y2={y}
          stroke="white" strokeOpacity={0.06} strokeWidth={1}
        />
      ))}

      {/* Price labels (left axis) */}
      {levels.map(({ price, y }) => (
        <text
          key={price}
          x={PAD_L - 8} y={y + 4}
          textAnchor="end"
          fill="rgba(255,255,255,0.28)"
          fontSize={10}
          fontFamily="inherit"
        >
          ${fmt(price)}
        </text>
      ))}

      {/* Time labels (bottom axis) */}
      {timeLabels.map(({ x, label }) => (
        <text
          key={label + x}
          x={x} y={VH - 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.22)"
          fontSize={9}
          fontFamily="inherit"
        >
          {label}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Main line with glow */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${gradId}-glow)`}
      />

      {/* Dashed horizontal at current price */}
      <line
        x1={PAD_L} y1={currentY}
        x2={VW - PAD_R} y2={currentY}
        stroke={color} strokeOpacity={0.35}
        strokeWidth={1} strokeDasharray="5 5"
      />

      {/* Current price pill tag */}
      <rect
        x={tagX} y={currentY - tagH / 2}
        width={tagW} height={tagH}
        rx={4} fill={color}
      />
      <text
        x={tagX + tagW / 2} y={currentY + 4}
        textAnchor="middle"
        fill="white" fontSize={10} fontWeight="700"
        fontFamily="inherit"
      >
        ${fmt(currentP)}
      </text>

      {/* Pulsing dot at latest price */}
      <circle cx={last.x} cy={currentY} r={3.5} fill={color} />
      <circle cx={last.x} cy={currentY} r={3.5} fill={color} fillOpacity="0.4">
        <animate attributeName="r"           values="3.5;9;3.5"   dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="fillOpacity" values="0.4;0;0.4"   dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function LandingBTCChart() {
  const [range,   setRange]   = useState<Range>('1M')
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  // stable gradient id per component instance
  const rawId = useId()
  const gradId = rawId.replace(/:/g, 'g')

  const load = useCallback(async (r: Range) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${rangeToDays[r]}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error()
      const raw: [number, number, number, number, number][] = await res.json()
      setCandles(raw.map(([time, open, high, low, close]) => ({ time, open, high, low, close })))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(range) }, [range, load])

  const last   = candles.at(-1)
  const first  = candles.at(0)
  const price  = last?.close   ?? 0
  const open   = first?.open   ?? 0
  const change = price - open
  const pct    = open ? (change / open) * 100 : 0
  const isUp   = change >= 0
  const color  = isUp ? 'text-emerald-400' : 'text-red-400'

  const high = candles.length ? Math.max(...candles.map(c => c.high)) : 0
  const low  = candles.length ? Math.min(...candles.map(c => c.low))  : 0

  return (
    <div className="w-full bg-[#080808]">
      {/* Header row */}
      <div className="px-6 sm:px-10 pt-8 pb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* Coin identity */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-black text-[#080808]">₿</span>
            <span className="text-sm font-bold text-white">Bitcoin</span>
            <span className="text-xs text-slate-600 font-medium">BTC / USD</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">Live</span>
          </div>

          {/* Price */}
          {loading ? (
            <div className="h-10 flex items-center">
              <Loader2 size={16} className="animate-spin text-slate-700" />
            </div>
          ) : error ? (
            <p className="text-slate-600 text-sm">Price unavailable</p>
          ) : (
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                ${fmt(price)}
              </span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${color}`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isUp ? '+' : '−'}${fmt(Math.abs(change))}
                &nbsp;({isUp ? '+' : ''}{pct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Range tabs */}
        <div className="flex gap-0.5 pb-1">
          {timeRanges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                range === r
                  ? 'bg-white/10 text-white'
                  : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: VH }}>
            <Loader2 size={24} className="animate-spin text-slate-800" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-slate-700 text-sm" style={{ height: VH }}>
            Chart unavailable
          </div>
        ) : (
          <AreaChart candles={candles} isUp={isUp} gradId={gradId} />
        )}
      </div>

      {/* Footer stats */}
      {!loading && !error && candles.length > 0 && (
        <div className="px-6 sm:px-10 pb-6 flex items-center gap-5 text-[11px] text-slate-700">
          <span>Period high <span className="text-slate-500 font-semibold">${fmt(high)}</span></span>
          <span>Period low <span className="text-slate-500 font-semibold">${fmt(low)}</span></span>
          <span className="ml-auto">Data via CoinGecko</span>
        </div>
      )}
    </div>
  )
}

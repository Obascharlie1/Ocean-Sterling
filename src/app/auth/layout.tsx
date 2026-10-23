'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, ShieldCheck } from 'lucide-react'
import { Wordmark } from '@/components/ui/Wordmark'
import { Reveal, CountUp, EASE } from '@/components/dashboard/motion'

const FEATURES = [
  { icon: TrendingUp, title: 'AI-driven signals',    body: 'Edge-generating trade ideas, updated in real time.' },
  { icon: Zap,        title: 'Sub-50ms execution',   body: 'Institutional-grade routing on every order.' },
  { icon: ShieldCheck,title: 'Bank-grade security',  body: '256-bit encryption and segregated accounts.' },
]

// A gently upward demo equity curve for the brand panel.
const SERIES = [22, 26, 24, 30, 33, 31, 38, 42, 40, 48, 52, 56, 54, 63, 68, 66, 74, 80, 78, 88]

function equityPath(w: number, h: number) {
  const min = Math.min(...SERIES), max = Math.max(...SERIES)
  const pts = SERIES.map((v, i) => ({
    x: (i / (SERIES.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * (h - 8) - 4,
  }))
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i], cx = (p0.x + p1.x) / 2
    d += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`
  }
  return { line: d, area: `${d} L${w},${h} L0,${h} Z` }
}

function EquityCard() {
  const W = 300, H = 92
  const { line, area } = equityPath(W, H)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="w-full max-w-sm rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-5 backdrop-blur-sm"
    >
      <p className="text-xs text-white/50">Portfolio value</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
        <span className="text-white/40 text-xl align-top">$</span><CountUp value={128450} /><span className="text-white/40 text-xl">.75</span>
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-secondary">
        <TrendingUp size={12} /> +18.4% all time
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-3 w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="authFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1BE38A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1BE38A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d={area} fill="url(#authFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }} />
        <motion.path
          d={line} fill="none" stroke="#1BE38A" strokeWidth="2" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
        />
      </svg>
    </motion.div>
  )
}

// Shown only on mobile, where the brand panel is hidden — a branded header
// with a bigger logo, a live chip and a self-drawing sparkline.
function MobileBrand() {
  const W = 260, H = 58
  const { line, area } = equityPath(W, H)
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="lg:hidden relative mb-8 rounded-[28px] bg-[#0B0F0D] text-white overflow-hidden px-6 py-7"
    >
      <motion.div
        className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-brand-primary/25 blur-[90px]"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(27,227,138,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,227,138,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="relative flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
          <Wordmark href={null} onDark className="h-11" />
        </motion.div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" /> AI-powered investing
        </span>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 w-full h-12 overflow-visible">
          <defs>
            <linearGradient id="authFillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1BE38A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1BE38A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path d={area} fill="url(#authFillMobile)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.6 }} />
          <motion.path d={line} fill="none" stroke="#1BE38A" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: EASE, delay: 0.2 }} />
        </svg>
      </div>
    </motion.div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F6F7F5] dark:bg-[#0A0B0A]">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[540px] flex-col relative overflow-hidden bg-[#0B0F0D] text-white flex-shrink-0">
        <motion.div
          className="pointer-events-none absolute -top-40 -left-24 w-[560px] h-[560px] rounded-full bg-brand-primary/20 blur-[130px]"
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(27,227,138,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,227,138,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link href="/" className="flex items-center">
            <Wordmark href={null} onDark className="h-9" />
          </Link>

          <div className="my-auto">
            <EquityCard />

            <Reveal delay={0.25}>
              <h2 className="mt-10 text-[32px] font-semibold leading-[1.15] tracking-tight max-w-sm">
                Hedge-fund firepower for every trader.
              </h2>
            </Reveal>

            <div className="mt-8 space-y-4 max-w-sm">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={0.35 + i * 0.1}>
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-white/[0.06] ring-1 ring-white/10 grid place-items-center flex-shrink-0">
                      <f.icon size={17} className="text-brand-secondary" />
                    </span>
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-sm text-white/55">{f.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Ocean Sterling. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-sm"
        >
          <MobileBrand />
          {children}
        </motion.div>
      </div>
    </div>
  )
}

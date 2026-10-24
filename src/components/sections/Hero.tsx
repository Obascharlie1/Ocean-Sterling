'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const METRICS = [
  { v: '10.4M+', l: 'Active traders' },
  { v: '$48B+', l: 'Volume traded' },
  { v: '140+', l: 'Markets' },
  { v: '99.97%', l: 'Uptime' },
]

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* Video background */}
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="auto" poster="/images/skyscraper.jpg">
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#060a08]/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]/40" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(rgba(27,227,138,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur px-3.5 py-1.5 text-xs font-medium text-white/85"
        >
          <span className="inline-flex items-center gap-1 text-brand-secondary"><Sparkles size={13} /> New</span>
          <span className="w-px h-3 bg-white/20" />
          AI copy trading &amp; bot — now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.03]"
        >
          Invest with the
          <br className="hidden sm:block" /> edge of a <span className="text-brand-secondary">hedge fund.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          className="mt-6 max-w-xl mx-auto text-lg leading-relaxed text-white/65"
        >
          AI signals, copy trading and an autonomous bot — institutional firepower,
          handed to traders who move first.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-dark-base text-[15px] font-semibold hover:opacity-90 active:scale-[0.98] transition">
            Start trading free <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link href="#how" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-white/20 bg-white/[0.04] text-white text-[15px] font-semibold hover:bg-white/[0.1] transition">
            <Play size={15} /> How it works
          </Link>
        </motion.div>

        {/* Metric strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.26 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/[0.06]"
        >
          {METRICS.map(m => (
            <div key={m.l} className="bg-[#060a08]/40 px-4 py-4">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-white tabular-nums">{m.v}</p>
              <p className="mt-0.5 text-xs text-white/50">{m.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

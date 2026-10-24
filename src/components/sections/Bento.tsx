'use client'

import { motion } from 'framer-motion'
import { Brain, Copy, Bot, Zap, ShieldCheck, Globe, TrendingUp } from 'lucide-react'
import { SectionHead } from '@/components/ui/Section'

const EASE = [0.16, 1, 0.3, 1] as const

function Cell({ className = '', delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={`relative overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0E100F] p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/15">
      {children}
    </span>
  )
}

export function Bento() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The platform"
          title="Everything you need to trade with an edge"
          subtitle="One account, every tool — AI signals, copy trading and a bot that works while you sleep."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Large — AI signals with mini chart */}
          <Cell className="md:col-span-4 md:row-span-2" delay={0}>
            <div className="flex items-start justify-between">
              <Icon><Brain size={19} /></Icon>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 rounded-full px-2.5 py-1">AI-powered</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-dark-base dark:text-white">AI signal engine</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-md">
              Millions of data points scanned every second to flag high-conviction setups before price moves — so you enter early, not late.
            </p>
            <div className="mt-6 -mb-2 h-28 sm:h-36">
              <svg viewBox="0 0 560 150" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="bentoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06C167" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#06C167" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,120 C60,110 90,70 140,78 C190,86 210,40 260,48 C320,57 340,96 400,80 C450,67 480,30 560,20 L560,150 L0,150 Z" fill="url(#bentoFill)" />
                <path d="M0,120 C60,110 90,70 140,78 C190,86 210,40 260,48 C320,57 340,96 400,80 C450,67 480,30 560,20" fill="none" stroke="#06C167" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </Cell>

          <Cell className="md:col-span-2" delay={0.05}>
            <Icon><Copy size={19} /></Icon>
            <h3 className="mt-4 text-lg font-semibold text-dark-base dark:text-white">Copy trading</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Mirror top traders automatically — every move copied in real time.</p>
          </Cell>

          <Cell className="md:col-span-2" delay={0.1}>
            <Icon><Bot size={19} /></Icon>
            <h3 className="mt-4 text-lg font-semibold text-dark-base dark:text-white">Autonomous AI bot</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Set your risk, fund it, switch it on. The engine trades around the clock.</p>
          </Cell>

          <Cell className="md:col-span-2" delay={0.12}>
            <Icon><Zap size={19} /></Icon>
            <h3 className="mt-4 text-lg font-semibold text-dark-base dark:text-white">Sub-50ms execution</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Institutional routing fills your orders the instant they trigger.</p>
          </Cell>

          <Cell className="md:col-span-2" delay={0.16}>
            <Icon><ShieldCheck size={19} /></Icon>
            <h3 className="mt-4 text-lg font-semibold text-dark-base dark:text-white">Bank-grade security</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">256-bit encryption, segregated funds and independent audits.</p>
          </Cell>

          <Cell className="md:col-span-2" delay={0.2}>
            <Icon><Globe size={19} /></Icon>
            <h3 className="mt-4 text-lg font-semibold text-dark-base dark:text-white">140+ markets</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Crypto, stocks, forex and commodities — all from one account.</p>
          </Cell>

          <Cell className="md:col-span-2 bg-[#0B0F0D] dark:bg-[#0B0F0D] border-transparent" delay={0.24}>
            <div className="pointer-events-none absolute -top-10 -right-6 w-32 h-32 rounded-full bg-brand-primary/20 blur-[50px]" />
            <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/[0.08] text-brand-secondary ring-1 ring-white/10"><TrendingUp size={19} /></span>
            <h3 className="mt-4 text-lg font-semibold text-white">Up to 20% / mo</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">Estimated returns across our managed strategies. Capital at risk.</p>
          </Cell>
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { UserPlus, Wallet, LineChart } from 'lucide-react'
import { SectionHead } from '@/components/ui/Section'

const EASE = [0.16, 1, 0.3, 1] as const

const STEPS = [
  { icon: UserPlus,  title: 'Create your account', body: 'Sign up in minutes and verify your identity with a single document.' },
  { icon: Wallet,    title: 'Fund your wallet',    body: 'Deposit by bank transfer, card, PayPal or crypto — credited on confirmation.' },
  { icon: LineChart, title: 'Trade or automate',   body: 'Follow AI signals, copy a top trader, or switch the bot on and let it run.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="py-16 lg:py-24 bg-light-surface/60 dark:bg-white/[0.02] border-y border-black/[0.06] dark:border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead eyebrow="How it works" title="Live in three steps" subtitle="No paperwork marathons. From sign-up to your first trade in under five minutes." />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0E100F] p-6"
            >
              <span className="absolute top-5 right-6 text-5xl font-semibold text-black/[0.04] dark:text-white/[0.06] tabular-nums">0{i + 1}</span>
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/15">
                <s.icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-dark-base dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Landmark, Bitcoin, Wallet, ArrowRight, ShieldCheck, Clock, Lock } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { PageHeader } from '@/components/dashboard/ui'
import { staggerParent, staggerChild } from '@/components/dashboard/motion'

const methods = [
  {
    href: '/dashboard/deposit/bank',
    icon: Landmark,
    label: 'Bank transfer',
    speed: '0–3 business days',
    fee: 'No fee',
    detail: 'Wire funds directly from your bank account.',
    tag: 'Recommended',
  },
  {
    href: '/dashboard/deposit/bitcoin',
    icon: Bitcoin,
    label: 'Bitcoin',
    speed: '~30 minutes',
    fee: 'Network fee only',
    detail: 'Send BTC to your dedicated deposit address.',
  },
  {
    href: '/dashboard/deposit/paypal',
    icon: Wallet,
    label: 'PayPal',
    speed: 'Within minutes',
    fee: '2.9% fee',
    detail: 'Pay from your PayPal balance or linked card.',
  },
]

const assurances = [
  { icon: Lock,        title: 'Bank-grade security',  body: '256-bit encryption on every transfer.' },
  { icon: ShieldCheck, title: 'Segregated accounts',  body: 'Client funds are held separately.' },
  { icon: Clock,       title: '24/7 monitoring',      body: 'Deposits reviewed around the clock.' },
]

export default function DepositPage() {
  return (
    <div>
      <TopBar title="Deposit" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Add funds"
          title="How would you like to deposit?"
          subtitle="Choose a method below. Your balance updates as soon as the payment is confirmed."
        />

        <motion.div variants={staggerParent} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {methods.map(m => (
            <motion.div key={m.href} variants={staggerChild} className="flex">
              <Link
                href={m.href}
                className="group relative flex flex-1 flex-col rounded-3xl bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.07] p-6 transition hover:-translate-y-0.5 hover:ring-black/15 dark:hover:ring-white/20 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-brand-primary/10 grid place-items-center">
                    <m.icon size={22} className="text-brand-primary" />
                  </span>
                  {m.tag && (
                    <span className="rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base px-2.5 py-1 text-[11px] font-semibold">
                      {m.tag}
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-lg font-semibold text-dark-base dark:text-white">{m.label}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{m.detail}</p>

                <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.07] space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Arrives</span><span className="font-medium text-dark-base dark:text-white">{m.speed}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Fee</span><span className="font-medium text-dark-base dark:text-white">{m.fee}</span></div>
                </div>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-dark-base dark:text-white">
                  Continue <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {assurances.map(a => (
            <div key={a.title} className="flex items-start gap-3 rounded-2xl px-1 py-2">
              <a.icon size={18} className="mt-0.5 text-brand-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-dark-base dark:text-white">{a.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{a.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">Minimum deposit is $100 across all methods.</p>
      </div>
    </div>
  )
}

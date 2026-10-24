'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { plans } from '@/data'
import { SectionHead } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

export function InvestmentPlans() {
  return (
    <section id="pricing" className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead eyebrow="Pricing" title="Plans that scale with you" subtitle="Start free. Upgrade when you're ready for more firepower. Cancel anytime." />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan, i) => {
            const featured = plan.highlighted
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className={cn(
                  'relative flex flex-col rounded-2xl p-6',
                  featured
                    ? 'bg-[#0B0F0D] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]'
                    : 'border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0E100F]'
                )}
              >
                {featured && (
                  <>
                    <div className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-brand-primary/20 blur-[60px]" />
                    <span className="absolute top-5 right-5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-brand-primary/20 text-brand-secondary px-2.5 py-1">Popular</span>
                  </>
                )}
                <p className={cn('relative text-sm font-medium', featured ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>{plan.name}</p>
                <div className="relative mt-3 flex items-baseline gap-1">
                  {plan.price === 0
                    ? <span className="text-4xl font-semibold tracking-tight">Free</span>
                    : <>
                        <span className={cn('text-4xl font-semibold tracking-tight tabular-nums', !featured && 'text-dark-base dark:text-white')}>${plan.price}</span>
                        <span className={featured ? 'text-white/50 text-sm' : 'text-slate-500 dark:text-slate-400 text-sm'}>/mo</span>
                      </>}
                </div>
                <p className={cn('relative mt-2 text-sm leading-relaxed', featured ? 'text-white/60' : 'text-slate-500 dark:text-slate-400')}>{plan.description}</p>

                <ul className="relative mt-5 space-y-2.5 flex-1">
                  {plan.features.slice(0, 6).map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={16} className={cn('mt-0.5 flex-shrink-0', featured ? 'text-brand-secondary' : 'text-brand-primary')} />
                      <span className={featured ? 'text-white/85' : 'text-dark-base dark:text-slate-200'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={cn(
                    'relative mt-6 h-11 rounded-full text-sm font-semibold inline-flex items-center justify-center active:scale-[0.98] transition',
                    featured
                      ? 'bg-brand-primary text-white hover:bg-brand-dim'
                      : 'bg-dark-base text-white dark:bg-white dark:text-dark-base hover:opacity-90'
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

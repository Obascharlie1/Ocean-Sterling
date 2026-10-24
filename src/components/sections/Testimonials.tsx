'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { testimonials } from '@/data'
import { SectionHead } from '@/components/ui/Section'

const EASE = [0.16, 1, 0.3, 1] as const

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-light-surface/60 dark:bg-white/[0.02] border-y border-black/[0.06] dark:border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead eyebrow="Loved by traders" title="Results that speak for themselves" subtitle="Join over ten million traders compounding with Ocean Sterling." />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.06 }}
              className="flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0E100F] p-6"
            >
              <div className="flex items-center gap-1 text-brand-primary">
                {Array.from({ length: t.rating }).map((_, s) => <Star key={s} size={14} className="fill-current" />)}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-dark-base dark:text-slate-200">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-black/[0.06] dark:border-white/[0.07]">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-[#034d2a] grid place-items-center text-xs font-semibold text-white flex-shrink-0">{t.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark-base dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.role}</p>
                </div>
                <span className="text-sm font-semibold text-brand-primary tabular-nums">{t.profit}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

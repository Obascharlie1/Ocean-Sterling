'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const
const POINTS = ['Free to start', 'No lock-in', 'Cancel anytime']

export function FinalCTA() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-[32px] bg-[#0B0F0D] text-white px-6 sm:px-14 py-16 text-center"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-brand-primary/20 blur-[130px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(rgba(27,227,138,0.7) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

          <h2 className="relative text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Ready to trade with the edge?
          </h2>
          <p className="relative mt-4 max-w-md mx-auto text-white/60 text-lg">
            Join millions of traders and put institutional firepower to work today.
          </p>

          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-dark-base text-[15px] font-semibold hover:opacity-90 active:scale-[0.98] transition">
              Create free account <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-white/20 bg-white/[0.04] text-white text-[15px] font-semibold hover:bg-white/[0.1] transition">
              Sign in
            </Link>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/55">
            {POINTS.map(p => (
              <span key={p} className="inline-flex items-center gap-1.5"><Check size={15} className="text-brand-secondary" /> {p}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

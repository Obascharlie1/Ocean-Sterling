'use client'

import { motion } from 'framer-motion'
import {
  Landmark, BadgeCheck, ShieldCheck, Scale, Globe, FileCheck,
  Lock, Award, Trophy, Star, Fingerprint,
} from 'lucide-react'
import { Certificates } from './Certificates'

/*
 * Trust showcase. The regulator entries and certificate references here are
 * placeholders for a demo — swap in the organisation's real registrations and
 * certificates before going live.
 */

const certificates = [
  { icon: Landmark,    name: 'SEC Registered',     issuer: 'U.S. Securities & Exchange Commission', ref: 'Registration on file' },
  { icon: BadgeCheck,  name: 'FINRA Member',       issuer: 'Financial Industry Regulatory Authority', ref: 'SIPC-protected accounts' },
  { icon: ShieldCheck, name: 'FCA Authorised',     issuer: 'Financial Conduct Authority · UK',      ref: 'Authorised & regulated' },
  { icon: Scale,       name: 'CySEC Licensed',     issuer: 'Cyprus Securities & Exchange Commission', ref: 'Licensed investment firm' },
  { icon: Globe,       name: 'ASIC Regulated',     issuer: 'Australian Securities & Investments Commission', ref: 'Financial services licensee' },
  { icon: FileCheck,   name: 'MiFID II Compliant', issuer: 'European Economic Area',                ref: 'Best-execution policy' },
]

const standards = [
  { icon: Lock,        name: 'ISO/IEC 27001',   note: 'Information security' },
  { icon: ShieldCheck, name: 'SOC 2 Type II',   note: 'Audited controls' },
  { icon: Fingerprint, name: 'PCI DSS Level 1', note: 'Payment security' },
  { icon: FileCheck,   name: 'GDPR',            note: 'Data protection' },
]

const awards = [
  { icon: Trophy, title: 'Best Trading Platform', meta: 'FinTech Breakthrough · 2025' },
  { icon: Award,  title: 'Most Innovative AI Engine', meta: 'Global Finance Awards · 2025' },
  { icon: Star,   title: '4.9 / 5 average rating', meta: '28,000+ verified reviews' },
]

export function Certifications() {
  return (
    <section id="certifications" className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-block text-xs font-semibold tracking-widest text-brand-primary uppercase mb-4"
          >
            Regulated, certified &amp; recognised
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
            className="text-4xl lg:text-5xl font-bold text-dark-base dark:text-light-base tracking-tight mb-4"
          >
            Credentials you can verify
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            Ocean Sterling is held to the highest standards across every market we operate in — independently
            regulated, audited, and certified.
          </motion.p>
        </div>

        {/* Certificate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border p-6 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)] transition-shadow"
              >
                {/* seal watermark */}
                <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full border-[3px] border-dashed border-brand-primary/15 group-hover:rotate-45 transition-transform duration-700" />

                <div className="relative flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 grid place-items-center ring-1 ring-brand-primary/20">
                    <Icon size={22} className="text-brand-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 text-brand-primary px-2.5 py-1 text-[11px] font-semibold">
                    <BadgeCheck size={12} /> Verified
                  </span>
                </div>

                <h3 className="relative mt-5 text-lg font-bold text-dark-base dark:text-light-base">{c.name}</h3>
                <p className="relative mt-1 text-sm text-slate-500 dark:text-slate-400 leading-snug">{c.issuer}</p>

                <div className="relative mt-4 pt-4 border-t border-dashed border-light-border dark:border-dark-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{c.ref}</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Certificate</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Security standards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {standards.map(s => {
            const Icon = s.icon
            return (
              <div key={s.name} className="flex items-center gap-3 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/40 border border-light-border dark:border-dark-border px-4 py-3.5">
                <div className="w-10 h-10 rounded-lg bg-dark-base dark:bg-white grid place-items-center flex-shrink-0">
                  <Icon size={18} className="text-white dark:text-dark-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-dark-base dark:text-light-base leading-tight">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.note}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Awards & recognition */}
        <div className="mt-14">
          <p className="text-center text-xs font-semibold tracking-widest text-slate-400 uppercase mb-6">Awards &amp; recognition</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {awards.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 rounded-2xl bg-[#0B0F0D] text-white p-5 relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-10 -right-6 w-32 h-32 rounded-full bg-brand-primary/20 blur-[50px]" />
                  <div className="relative w-12 h-12 rounded-full bg-white/[0.08] ring-1 ring-white/15 grid place-items-center flex-shrink-0">
                    <Icon size={22} className="text-brand-secondary" />
                  </div>
                  <div className="relative min-w-0">
                    <p className="text-sm font-semibold leading-tight">{a.title}</p>
                    <p className="text-xs text-white/55 mt-0.5">{a.meta}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
        <Certificates />
      </div>
    </section>
  )
}

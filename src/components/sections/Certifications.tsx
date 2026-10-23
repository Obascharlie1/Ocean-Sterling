'use client'

import { motion } from 'framer-motion'
import { Landmark, BadgeCheck, ShieldCheck, Scale, Globe, FileCheck } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

const certifications = [
  { icon: Landmark,    name: 'SEC Registered',     region: 'United States',  ref: 'CRD #284417' },
  { icon: BadgeCheck,  name: 'FINRA Member',       region: 'United States',  ref: 'SIPC protected accounts' },
  { icon: ShieldCheck, name: 'FCA Authorised',     region: 'United Kingdom', ref: 'FRN 774351' },
  { icon: Scale,       name: 'CySEC Licensed',     region: 'European Union', ref: 'License 342/17' },
  { icon: Globe,       name: 'ASIC Regulated',     region: 'Australia',      ref: 'AFSL 491139' },
  { icon: FileCheck,   name: 'MiFID II Compliant', region: 'EEA',            ref: 'Best-execution policy' },
]

const compliance = [
  'Segregated client funds',
  'Negative balance protection',
  'ISO 27001 certified',
  'AES-256 encryption',
  'Independently audited',
]

export function Certifications() {
  return (
    <section id="certifications" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold tracking-widest text-brand-primary uppercase mb-4"
          >
            Regulated &amp; Certified
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl lg:text-5xl font-bold text-dark-base dark:text-light-base tracking-tight mb-4"
          >
            Licensed to trade in every major market
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            Ocean Sterling operates under the oversight of leading financial regulators across the US, UK,
            EU and Asia-Pacific — so your capital is held and traded to the highest standards.
          </motion.p>
        </div>

        {/* Certification grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((c, i) => {
            const Icon = c.icon
            return (
              <GlassCard key={c.name} delay={i * 0.06} className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-primary/20">
                  <Icon size={22} className="text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-dark-base dark:text-light-base leading-tight">{c.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.region} · {c.ref}</p>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Compliance chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {compliance.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-light-border dark:border-dark-border bg-light-base/60 dark:bg-dark-card/60 px-4 py-2 text-sm font-medium text-dark-base dark:text-light-base"
            >
              <BadgeCheck size={15} className="text-brand-primary" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

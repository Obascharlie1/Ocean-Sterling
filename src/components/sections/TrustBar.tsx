'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { stats, partners } from '@/data'

export function TrustBar() {
  return (
    <section className="bg-light-surface/60 dark:bg-dark-surface/40 border-y border-light-border dark:border-dark-border overflow-hidden">
      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl lg:text-4xl font-bold text-dark-base dark:text-light-base mb-1">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 2 : 0}
                />
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partner ticker */}
      <div className="border-t border-light-border dark:border-dark-border py-7 overflow-hidden">
        <div className="w-max flex items-center gap-16 px-10 animate-ticker">
          {[...partners, ...partners].map((p, i) => (
            <div key={`${p.name}-${i}`} className="flex items-center gap-2.5 flex-shrink-0 opacity-55 hover:opacity-85 transition-opacity">
              <img
                src={p.logo}
                alt={p.name}
                className="h-6 w-auto object-contain dark:invert"
              />
              <span className="text-sm font-semibold text-dark-base dark:text-light-base tracking-tight whitespace-nowrap">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

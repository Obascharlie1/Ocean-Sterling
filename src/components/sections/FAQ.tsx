'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { SectionHead } from '@/components/ui/Section'

const EASE = [0.16, 1, 0.3, 1] as const

const FAQS = [
  { q: 'How do I get started?', a: 'Create a free account, verify your identity with one document, and make your first deposit. You can be trading in under five minutes.' },
  { q: 'What is copy trading?', a: 'Copy trading lets you mirror a professional trader automatically. Pick a trader, set an allocation, and every position they open is reproduced on your account in proportion.' },
  { q: 'How does the AI bot work?', a: 'Fund the bot, choose a risk profile, and switch it on. It scans the markets around the clock and executes on your behalf. You can pause it any time and your funds stay in your account.' },
  { q: 'How fast are deposits and withdrawals?', a: 'Card and crypto deposits are usually credited within minutes. Withdrawals are verified with a one-time code and typically settle within 1–3 business days.' },
  { q: 'Is my money safe?', a: 'Funds are held in segregated accounts with bank-grade 256-bit encryption, and the platform is independently audited. Capital is always at risk when trading.' },
  { q: 'Can I cancel any time?', a: 'Yes. Plans are month-to-month with no lock-in — upgrade, downgrade or cancel whenever you like.' },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />

        <div className="mt-10 divide-y divide-black/[0.08] dark:divide-white/[0.08] border-t border-b border-black/[0.08] dark:border-white/[0.08]">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-4 py-5 text-left">
                  <span className="flex-1 text-[15px] font-medium text-dark-base dark:text-white">{f.q}</span>
                  <Plus size={18} className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-45 text-brand-primary' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden"
                    >
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

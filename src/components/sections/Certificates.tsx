'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, FileCheck } from 'lucide-react'

interface Certificate { id: string; title: string; issuer?: string; image_url: string }

const EASE = [0.16, 1, 0.3, 1] as const
const PLACEHOLDERS = ['Incorporation', 'Authorization', 'ISO / Quality']

/** Admin-managed certificate images. Shows placeholder slots until any are uploaded. */
export function Certificates({ compact = false }: { compact?: boolean }) {
  const [certs, setCerts] = useState<Certificate[] | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/certificates').then(r => r.json())
      .then(({ data }) => { if (alive) setCerts(data ?? []) })
      .catch(() => { if (alive) setCerts([]) })
    return () => { alive = false }
  }, [])

  const hasCerts = certs && certs.length > 0

  if (compact) {
    // Footer strip
    return (
      <div className="flex flex-wrap items-center gap-3">
        {hasCerts
          ? certs.map(c => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={c.id} src={c.image_url} alt={c.title} title={c.title}
                className="h-14 w-auto rounded-md border border-light-border dark:border-dark-border bg-white object-contain p-1" />
            ))
          : PLACEHOLDERS.map(p => (
              <div key={p} className="h-14 w-20 rounded-md border border-dashed border-light-border dark:border-dark-border grid place-items-center text-slate-400">
                <FileCheck size={18} />
              </div>
            ))}
      </div>
    )
  }

  // Landing certifications panel
  return (
    <div className="mt-14">
      <p className="text-center text-xs font-semibold tracking-widest text-slate-400 uppercase mb-6">Certificates</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {hasCerts
          ? certs.map((c, i) => (
              <motion.a
                key={c.id}
                href={c.image_url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="group rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0E100F] overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image_url} alt={c.title} className="w-full h-48 object-contain bg-white p-3" />
                <div className="px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <p className="text-sm font-bold text-dark-base dark:text-white truncate">{c.title}</p>
                  {c.issuer && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.issuer}</p>}
                </div>
              </motion.a>
            ))
          : PLACEHOLDERS.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="rounded-2xl border border-dashed border-black/[0.12] dark:border-white/[0.14] bg-white/50 dark:bg-[#0E100F]/50 h-56 grid place-items-center text-center px-6"
              >
                <div>
                  <span className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary"><Award size={22} /></span>
                  <p className="mt-3 text-sm font-bold text-dark-base dark:text-white">{p} certificate</p>
                  <p className="mt-1 text-xs text-slate-400">Upload in admin to display here</p>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  )
}

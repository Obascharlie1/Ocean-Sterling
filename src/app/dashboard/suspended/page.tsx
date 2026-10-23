'use client'

import { motion } from 'framer-motion'
import { ShieldX, MessageSquare } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { Reveal } from '@/components/dashboard/motion'

// Opens the site-wide live chat widget (loaded in the root layout).
function openLiveChat() {
  const chat = (window as unknown as { chaport?: { q: (cmd: string) => void } }).chaport
  chat?.q('open')
}

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Reveal className="w-full max-w-md">
        <Card className="relative overflow-hidden px-8 py-12 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-rose-500/10 blur-[90px]" />
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="relative mx-auto w-20 h-20 rounded-full bg-rose-500/10 ring-1 ring-rose-500/25 grid place-items-center"
          >
            <ShieldX size={34} className="text-rose-600 dark:text-rose-400" />
          </motion.span>

          <h1 className="relative mt-7 text-2xl font-semibold tracking-tight text-dark-base dark:text-white">Account suspended</h1>
          <p className="relative mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Your account has been paused by an administrator, so the dashboard and transactions are unavailable for now.
          </p>
          <p className="relative mt-2 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            If you think this is a mistake, contact our support team and we&apos;ll look into it.
          </p>

          <button
            onClick={openLiveChat}
            className="relative mt-8 inline-flex items-center justify-center gap-2 h-12 w-full max-w-xs rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold hover:opacity-90 active:scale-[0.98] transition"
          >
            <MessageSquare size={17} /> Contact support
          </button>
        </Card>
      </Reveal>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ShieldX, MessageSquare } from 'lucide-react'

export default function SuspendedPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/30">
            <ShieldX size={36} className="text-brand-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-dark-base dark:text-light-base mb-3">
          Account Suspended
        </h1>

        {/* Body */}
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          Your account has been suspended by an administrator. You are currently unable to access your dashboard or make transactions.
        </p>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          If you believe this is a mistake, please reach out to our support team through the messaging feature below.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center justify-center gap-2.5 w-full max-w-xs mx-auto px-6 py-4 rounded-full bg-brand-primary text-white font-bold text-base hover:bg-brand-dim transition-colors duration-150"
        >
          <MessageSquare size={18} />
          Message Support
        </Link>

        <p className="mt-6 text-xs text-slate-400">
          Ref: account suspended · Tesla Capital
        </p>
      </div>
    </div>
  )
}

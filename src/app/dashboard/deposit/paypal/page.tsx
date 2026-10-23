'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, CopyField, PageHeader, SectionTitle } from '@/components/dashboard/ui'
import { DepositForm } from '@/components/dashboard/DepositForm'

const REFERENCE = 'OS847392'

export default function PaypalDepositPage() {
  const [email, setEmail] = useState('payments@oceansterling.io')

  useEffect(() => {
    fetch('/api/payment-config')
      .then(r => r.json())
      .then(d => { if (d.paypal_email) setEmail(d.paypal_email) })
      .catch(() => {})
  }, [])

  const steps = [
    'Open PayPal and choose Send & Request.',
    'Send the amount to the email address below.',
    'Paste your reference into the note so we can match it.',
  ]

  return (
    <div>
      <TopBar title="Deposit" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          back={{ href: '/dashboard/deposit', label: 'All methods' }}
          eyebrow="PayPal"
          title="Deposit with PayPal"
          subtitle="Send a PayPal payment, then confirm the amount here. Usually credited within minutes."
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          <div className="space-y-6">
            <Card className="p-6">
              <SectionTitle step={1}>How it works</SectionTitle>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/12 text-brand-primary grid place-items-center text-xs font-semibold flex-shrink-0">{i + 1}</span>
                    <span className="text-[15px] text-slate-600 dark:text-slate-300">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6">
              <SectionTitle step={2}>Payment details</SectionTitle>
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                <CopyField label="Send to (PayPal email)" value={email} />
                <CopyField label="Reference — add to the note" value={REFERENCE} mono large />
              </div>
            </Card>
          </div>

          <DepositForm
            method="PayPal"
            feePct={0.029}
            note={`Ref: ${REFERENCE}`}
            submitLabel="I've sent via PayPal"
            success={{
              title: 'PayPal payment recorded',
              body: "Once we receive your PayPal payment, your balance will be credited — usually within a few minutes.",
            }}
          />
        </div>
      </div>
    </div>
  )
}

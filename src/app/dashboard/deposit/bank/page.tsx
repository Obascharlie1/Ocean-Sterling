'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, CopyField, PageHeader, SectionTitle } from '@/components/dashboard/ui'
import { DepositForm } from '@/components/dashboard/DepositForm'

const REFERENCE = 'OS-2025-847392'

const DEFAULT_BANK = {
  bank_name: 'Chase Bank',
  bank_account_name: 'Ocean Sterling Ltd',
  bank_account_number: '4521 8847 3920 1547',
  bank_sort_code: '20-19-15',
  bank_swift: 'CHASUS33',
}

export default function BankDepositPage() {
  const [bank, setBank] = useState(DEFAULT_BANK)

  useEffect(() => {
    fetch('/api/payment-config')
      .then(r => r.json())
      .then(d => setBank({
        bank_name:           d.bank_name           || DEFAULT_BANK.bank_name,
        bank_account_name:   d.bank_account_name   || DEFAULT_BANK.bank_account_name,
        bank_account_number: d.bank_account_number || DEFAULT_BANK.bank_account_number,
        bank_sort_code:      d.bank_sort_code      || DEFAULT_BANK.bank_sort_code,
        bank_swift:          d.bank_swift          || DEFAULT_BANK.bank_swift,
      }))
      .catch(() => {})
  }, [])

  return (
    <div>
      <TopBar title="Deposit" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          back={{ href: '/dashboard/deposit', label: 'All methods' }}
          eyebrow="Bank transfer"
          title="Send a bank transfer"
          subtitle="Transfer from your bank to the account below, then confirm the amount here."
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          <div className="space-y-6">
            <Card className="p-6">
              <SectionTitle step={1}>Use this payment reference</SectionTitle>
              <div className="rounded-2xl bg-brand-primary/[0.07] ring-1 ring-brand-primary/20 px-5">
                <CopyField label="Reference" value={REFERENCE} mono large />
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Info size={15} className="mt-0.5 flex-shrink-0" />
                Add this in the reference / memo field so we can match your payment instantly.
              </p>
            </Card>

            <Card className="p-6">
              <SectionTitle step={2}>Send to this account</SectionTitle>
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                <CopyField label="Bank name"      value={bank.bank_name} />
                <CopyField label="Account name"   value={bank.bank_account_name} />
                <CopyField label="Account number" value={bank.bank_account_number} mono />
                <CopyField label="Sort code"      value={bank.bank_sort_code} mono />
                <CopyField label="SWIFT / BIC"    value={bank.bank_swift} mono />
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle step={3}>Confirm your transfer</SectionTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the amount you sent and attach a receipt if you have one. We&apos;ll credit your
                balance once the funds arrive — usually within 0–3 business days.
              </p>
            </Card>
          </div>

          <DepositForm
            method="Bank Transfer"
            note={`Ref: ${REFERENCE}`}
            submitLabel="I've made the transfer"
            success={{
              title: 'Transfer recorded',
              body: "We'll credit your balance as soon as your bank transfer arrives — usually within 0–3 business days.",
              meta: <p className="text-sm text-slate-500">Reference <span className="font-mono font-semibold text-dark-base dark:text-white">{REFERENCE}</span></p>,
            }}
          />
        </div>
      </div>
    </div>
  )
}

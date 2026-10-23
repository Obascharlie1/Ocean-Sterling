'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, CopyField, PageHeader, SectionTitle } from '@/components/dashboard/ui'
import { DepositForm } from '@/components/dashboard/DepositForm'

const BTC_RATE = 67420

export default function BitcoinDepositPage() {
  const [address, setAddress] = useState('bc1qazx4cmj3m8n2952p28aqk6ntw6hr7d3sfm6jps')
  const [qr, setQr] = useState('')

  useEffect(() => {
    fetch('/api/payment-config')
      .then(r => r.json())
      .then(d => { if (d.btc_address) setAddress(d.btc_address) })
      .catch(() => {})
  }, [])

  // Real, scannable QR for the configured deposit address.
  useEffect(() => {
    QRCode.toDataURL(`bitcoin:${address}`, { margin: 1, width: 440, color: { dark: '#0A0A0A', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [address])

  return (
    <div>
      <TopBar title="Deposit" />
      <div className="px-4 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          back={{ href: '/dashboard/deposit', label: 'All methods' }}
          eyebrow="Bitcoin"
          title="Deposit with Bitcoin"
          subtitle="Scan or copy your deposit address, send BTC, then confirm the amount here."
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          <div className="space-y-6">
            <Card className="p-6">
              <SectionTitle step={1}>Send BTC to this address</SectionTitle>
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <div className="flex-shrink-0 rounded-3xl bg-white p-3 ring-1 ring-black/[0.08] shadow-sm">
                  {qr ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={qr} alt="Bitcoin deposit address QR code" className="w-44 h-44" />
                  ) : (
                    <div className="w-44 h-44 rounded-2xl bg-slate-100 animate-pulse" />
                  )}
                </div>
                <div className="w-full sm:flex-1 grid grid-cols-3 sm:grid-cols-1 gap-2">
                  {[['Network', 'Bitcoin'], ['Confirmations', '3'], ['Minimum', '$100']].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-4 py-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{k}</p>
                      <p className="mt-0.5 sm:mt-0 text-sm font-semibold text-dark-base dark:text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-5">
                <CopyField label="Deposit address" value={address} mono />
              </div>
              <p className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-500/[0.07] ring-1 ring-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                Only send Bitcoin (BTC) on the Bitcoin network. Other assets sent here can&apos;t be recovered.
              </p>
            </Card>

            <Card className="p-6">
              <SectionTitle step={2}>Confirm your deposit</SectionTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the USD value you sent. Your balance is credited after 3 network confirmations —
                typically 30–60 minutes.
              </p>
            </Card>
          </div>

          <DepositForm
            method="Bitcoin"
            submitLabel="I've sent Bitcoin"
            extra={amt => (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ≈ <span className="font-mono font-semibold text-dark-base dark:text-white">₿{(amt / BTC_RATE).toFixed(8)}</span>
                <span className="text-slate-400"> at ${BTC_RATE.toLocaleString()}/BTC</span>
              </p>
            )}
            success={{
              title: 'Bitcoin deposit recorded',
              body: "We'll credit your balance once your transaction reaches 3 confirmations — typically 30–60 minutes.",
            }}
          />
        </div>
      </div>
    </div>
  )
}

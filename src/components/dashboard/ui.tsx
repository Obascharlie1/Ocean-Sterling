'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArrowLeft, Check, Copy, FileText, Upload, X, Loader2 } from 'lucide-react'
import { Reveal } from './motion'

/* Shared premium building blocks for the money flows (deposit / withdraw). */

export const inputCls =
  'h-12 w-full rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.08] px-4 text-[15px] text-dark-base dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-primary focus:bg-white dark:focus:bg-white/[0.06]'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.07] ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ back, eyebrow, title, subtitle }: {
  back?: { href: string; label: string }
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <Reveal className="mb-8">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-dark-base dark:hover:text-white transition mb-5">
          <ArrowLeft size={15} /> {back.label}
        </Link>
      )}
      {eyebrow && <p className="text-sm font-medium text-brand-primary">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl sm:text-[34px] font-semibold tracking-tight text-dark-base dark:text-white">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-[15px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </Reveal>
  )
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex items-baseline justify-between mb-2">
      <span className="text-sm font-medium text-dark-base dark:text-white">{children}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function SectionTitle({ step, children }: { step?: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {step !== undefined && (
        <span className="w-7 h-7 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base grid place-items-center text-xs font-semibold">
          {step}
        </span>
      )}
      <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">{children}</h2>
    </div>
  )
}

export function AmountInput({ value, onChange, placeholder = '0.00', onMax }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onMax?: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.08] px-5 h-[72px] transition focus-within:ring-2 focus-within:ring-brand-primary">
      <span className="text-3xl font-semibold text-slate-400">$</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent text-3xl font-semibold tracking-tight tabular-nums text-dark-base dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {onMax && (
        <button type="button" onClick={onMax} className="h-8 px-3 rounded-full bg-black/[0.06] dark:bg-white/10 text-xs font-semibold text-dark-base dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition">
          Max
        </button>
      )}
    </div>
  )
}

export function QuickAmounts({ values, onPick }: { values: number[]; onPick: (v: number) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="h-8 px-3.5 rounded-full ring-1 ring-black/[0.08] dark:ring-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:ring-brand-primary hover:text-brand-primary active:scale-95 transition tabular-nums"
        >
          ${v.toLocaleString()}
        </button>
      ))}
    </div>
  )
}

export function CopyField({ label, value, mono = false, large = false }: {
  label: string
  value: string
  mono?: boolean
  large?: boolean
}) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-0.5 break-all text-dark-base dark:text-white ${mono ? 'font-mono' : 'font-medium'} ${large ? 'text-lg font-semibold tracking-wide' : 'text-[15px]'}`}>
          {value || '—'}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className={`flex-shrink-0 h-9 px-3 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold transition ${
          copied ? 'bg-brand-primary/12 text-brand-primary' : 'bg-black/[0.04] dark:bg-white/[0.07] text-slate-600 dark:text-slate-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
        }`}
      >
        {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
      </button>
    </div>
  )
}

export function ReceiptUpload({ file, onChange, hint = 'Screenshot or PDF of your payment' }: {
  file: File | null
  onChange: (f: File | null) => void
  hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <Label hint="Optional">Payment receipt</Label>
      {file ? (
        <div className="flex items-center gap-3 rounded-2xl ring-1 ring-brand-primary/40 bg-brand-primary/[0.06] px-4 py-3">
          <span className="w-9 h-9 rounded-xl bg-brand-primary/15 grid place-items-center">
            <FileText size={16} className="text-brand-primary" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-base dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={() => onChange(null)} aria-label="Remove receipt" className="w-8 h-8 rounded-full grid place-items-center text-slate-500 hover:bg-black/5 dark:hover:bg-white/10">
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-dashed border-black/15 dark:border-white/15 py-5 text-sm text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/[0.03] transition"
        >
          <Upload size={16} /> {hint}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
    </div>
  )
}

export function PrimaryButton({ children, loading, disabled, type = 'submit', onClick }: {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-12 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      {loading ? <><Loader2 size={17} className="animate-spin" /> Processing…</> : children}
    </button>
  )
}

export function SummaryRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm ${strong ? 'font-semibold text-dark-base dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
      <span className={`tabular-nums ${strong ? 'text-lg font-semibold text-dark-base dark:text-white' : 'text-sm font-medium text-dark-base dark:text-white'}`}>{value}</span>
    </div>
  )
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-rose-500/[0.07] ring-1 ring-rose-500/25 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
      {children}
    </div>
  )
}

export function SuccessState({ title, body, meta }: { title: string; body: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <Card className="max-w-lg mx-auto px-8 py-12 text-center">
      <div className="relative mx-auto w-20 h-20">
        <span className="absolute inset-0 rounded-full bg-brand-primary/15 animate-ping [animation-iteration-count:2]" />
        <span className="relative w-20 h-20 rounded-full bg-brand-primary grid place-items-center shadow-lg shadow-brand-primary/30">
          <Check size={34} strokeWidth={2.5} className="text-white" />
        </span>
      </div>
      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-dark-base dark:text-white">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 whitespace-pre-line">{body}</div>
      {meta && <div className="mt-5">{meta}</div>}
      <div className="mt-8 flex flex-col sm:flex-row gap-2.5 justify-center">
        <Link href="/dashboard" className="h-11 px-6 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold inline-flex items-center justify-center hover:opacity-90 transition">
          Back to overview
        </Link>
        <Link href="/dashboard/transactions" className="h-11 px-6 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold text-dark-base dark:text-white inline-flex items-center justify-center hover:ring-black/25 dark:hover:ring-white/30 transition">
          View transactions
        </Link>
      </div>
    </Card>
  )
}

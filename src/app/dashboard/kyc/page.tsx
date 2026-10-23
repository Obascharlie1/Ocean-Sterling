'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Upload, FileText, Loader2, BookOpen, Car, IdCard, Check, X, Lock, ShieldCheck,
  Hourglass, BadgeCheck, ArrowRight, ZoomIn, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, PageHeader, PrimaryButton, ErrorNote } from '@/components/dashboard/ui'
import { Reveal, EASE } from '@/components/dashboard/motion'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, DEMO_PROFILE } from '@/lib/demo'

type DocType = 'passport' | 'drivers_license' | 'national_id'

interface UploadedFile {
  name: string
  size: string
  file: File
  preview: string | null
}

const docTypes: { value: DocType; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'passport',        label: 'Passport',         desc: 'Photo page only',      icon: BookOpen },
  { value: 'drivers_license', label: "Driver's license", desc: 'Front and back',       icon: Car },
  { value: 'national_id',     label: 'National ID',      desc: 'Front and back',       icon: IdCard },
]

const docTypeLabels: Record<DocType, string> = {
  passport:        'Passport',
  drivers_license: "Driver's License",
  national_id:     'National ID',
}

const REQUIREMENTS = [
  'Valid and not expired',
  'All four corners visible',
  'Clear, glare-free and legible',
  'JPG, PNG or PDF up to 10 MB',
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toUpload(f: File): UploadedFile {
  return {
    name: f.name,
    size: formatSize(f.size),
    file: f,
    preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
  }
}

function DropZone({ label, file, onFile, onView }: { label: string; file: UploadedFile | null; onFile: (f: UploadedFile | null) => void; onView?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function take(f: File | undefined) {
    if (f) onFile(toUpload(f))
  }

  return (
    <div>
      <p className="text-sm font-medium text-dark-base dark:text-white mb-2">{label}</p>
      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex items-center gap-4 rounded-2xl ring-1 ring-brand-primary/40 bg-brand-primary/[0.05] p-3 pr-4"
          >
            <button
              type="button"
              onClick={onView}
              disabled={!file.preview}
              aria-label={file.preview ? `Preview ${label}` : undefined}
              className="group relative w-16 h-12 rounded-xl overflow-hidden bg-brand-primary/10 grid place-items-center flex-shrink-0 enabled:cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {file.preview ? <img src={file.preview} alt="" className="w-full h-full object-cover" /> : <FileText size={18} className="text-brand-primary" />}
              {file.preview && (
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
                  <ZoomIn size={15} className="text-white" />
                </span>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-base dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Check size={12} className="text-brand-primary" /> {file.size} · {file.preview ? 'Tap to preview' : 'Ready'}</p>
            </div>
            <button type="button" onClick={() => onFile(null)} aria-label={`Remove ${label}`} className="w-8 h-8 rounded-full grid place-items-center text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 transition">
              <X size={15} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setOver(true) }}
            onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]) }}
            className={`w-full rounded-2xl border border-dashed py-8 text-center transition ${
              over
                ? 'border-brand-primary bg-brand-primary/[0.06] scale-[1.01]'
                : 'border-black/15 dark:border-white/15 hover:border-brand-primary hover:bg-brand-primary/[0.03]'
            }`}
          >
            <span className={`mx-auto w-11 h-11 rounded-full grid place-items-center transition ${over ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500'}`}>
              <Upload size={18} />
            </span>
            <p className="mt-3 text-sm font-medium text-dark-base dark:text-white">{over ? 'Drop to upload' : 'Drag a file here, or click to browse'}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPG, PNG or PDF · max 10 MB</p>
          </motion.button>
        )}
      </AnimatePresence>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => take(e.target.files?.[0])} />
    </div>
  )
}

export default function KYCPage() {
  const [docType,   setDocType]   = useState<DocType>('passport')
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null)
  const [backFile,  setBackFile]  = useState<UploadedFile | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [kycStatus, setKycStatus] = useState<string>('None')
  const [fetchingStatus, setFetchingStatus] = useState(true)
  const [viewer,    setViewer]    = useState<'front' | 'back' | null>(null)

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setKycStatus(DEMO_PROFILE.kyc_status)
        setFetchingStatus(false)
        return
      }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single()
      setKycStatus(data?.kyc_status ?? 'None')
      setFetchingStatus(false)
    }
    load()
  }, [])

  const needsBack = docType !== 'passport'
  const canSubmit = frontFile !== null && (!needsBack || backFile !== null)
  const step = canSubmit ? 3 : frontFile ? 2 : 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 900))
      setLoading(false)
      setSubmitted(true)
      return
    }

    const form = new FormData()
    form.append('front', frontFile!.file)
    if (needsBack && backFile) form.append('back', backFile.file)
    form.append('docType', docTypeLabels[docType])

    const res = await fetch('/api/kyc/upload', { method: 'POST', body: form })
    const json = await res.json()

    if (!res.ok) {
      setError(json?.error ?? 'Upload failed. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (fetchingStatus) {
    return (
      <div>
        <TopBar title="Verification" />
        <div className="flex items-center justify-center h-72">
          <Loader2 size={22} className="animate-spin text-brand-primary" />
        </div>
      </div>
    )
  }

  if (kycStatus === 'Verified') {
    return (
      <StatusScreen
        icon={BadgeCheck}
        tone="success"
        title="You're verified"
        body="Your identity has been confirmed. Withdrawals, higher limits and every plan are unlocked."
        perks={['Unlimited withdrawals', 'Higher deposit limits', 'All investment plans']}
      />
    )
  }

  if (kycStatus === 'Pending' || submitted) {
    return (
      <StatusScreen
        icon={Hourglass}
        tone="pending"
        title={submitted ? 'Documents submitted' : 'Verification in review'}
        body="Our compliance team is reviewing your documents. You'll get a notification within 24–48 hours."
        files={submitted ? [frontFile, backFile].filter(Boolean) as UploadedFile[] : undefined}
      />
    )
  }

  return (
    <div>
      <TopBar title="Verification" />
      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          back={{ href: '/dashboard', label: 'Overview' }}
          eyebrow="Identity check"
          title="Verify your identity"
          subtitle="A quick, one-time check required by financial regulation. It takes about two minutes."
        />

        {/* Stepper */}
        <Reveal className="mb-8 flex items-center gap-2 sm:gap-3 text-sm overflow-x-auto">
          {['Document', 'Upload', 'Submit'].map((s, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={s} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <span className="relative h-px w-8 sm:w-12 bg-black/15 dark:bg-white/15 overflow-hidden">
                    <motion.span className="absolute inset-0 bg-brand-primary origin-left" initial={false} animate={{ scaleX: step >= n ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE }} />
                  </span>
                )}
                <span className={`inline-flex items-center gap-2 whitespace-nowrap font-medium transition-colors ${active || done ? 'text-dark-base dark:text-white' : 'text-slate-400'}`}>
                  <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-semibold transition-colors ${
                    done ? 'bg-brand-primary text-white' : active ? 'bg-dark-base text-white dark:bg-white dark:text-dark-base' : 'ring-1 ring-black/15 dark:ring-white/20'
                  }`}>
                    {done ? <Check size={12} strokeWidth={3} /> : n}
                  </span>
                  {s}
                </span>
              </div>
            )
          })}
        </Reveal>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            <Reveal delay={0.05}>
              <Card className="p-6">
                <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Choose a document</h2>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {docTypes.map(dt => {
                    const on = docType === dt.value
                    return (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => { if (!on) { setDocType(dt.value); setFrontFile(null); setBackFile(null) } }}
                        className={`relative text-left rounded-2xl p-4 transition active:scale-[0.98] ${
                          on ? 'ring-2 ring-brand-primary bg-brand-primary/[0.05]' : 'ring-1 ring-black/[0.08] dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/25'
                        }`}
                      >
                        <AnimatePresence>
                          {on && (
                            <motion.span
                              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-primary grid place-items-center"
                            >
                              <Check size={12} strokeWidth={3} className="text-white" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <dt.icon size={20} className={on ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400'} />
                        <p className="mt-3 text-sm font-semibold text-dark-base dark:text-white">{dt.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{dt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="p-6 space-y-5">
                <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Upload photos</h2>
                <DropZone label={needsBack ? 'Front side' : 'Photo page'} file={frontFile} onFile={setFrontFile} onView={() => setViewer('front')} />
                <AnimatePresence initial={false}>
                  {needsBack && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                      <DropZone label="Back side" file={backFile} onFile={setBackFile} onView={() => setViewer('back')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="xl:sticky xl:top-24 space-y-4">
            <Card className="p-6">
              <h2 className="text-[17px] font-semibold text-dark-base dark:text-white">Before you submit</h2>
              <ul className="mt-4 space-y-2.5">
                {REQUIREMENTS.map(req => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-brand-primary/12 text-brand-primary grid place-items-center flex-shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {req}
                  </li>
                ))}
              </ul>
              {error && <div className="mt-5"><ErrorNote>{error}</ErrorNote></div>}
              <div className="mt-6">
                <PrimaryButton loading={loading} disabled={!canSubmit}>Submit for review</PrimaryButton>
              </div>
            </Card>
            <div className="flex items-start gap-2.5 px-2 text-xs text-slate-500 dark:text-slate-400">
              <Lock size={14} className="mt-0.5 flex-shrink-0 text-brand-primary" />
              <span>Documents are encrypted in transit and at rest, and only seen by our compliance team.</span>
            </div>
          </Reveal>
        </form>
      </div>

      <AnimatePresence>
        {viewer && (
          <DocViewer
            front={frontFile}
            back={needsBack ? backFile : null}
            side={viewer}
            docType={docTypeLabels[docType]}
            onSide={setViewer}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── premium upload preview viewer (user side) ───────────────────────────── */

function DocViewer({ front, back, side, docType, onSide, onClose }: {
  front: UploadedFile | null
  back: UploadedFile | null
  side: 'front' | 'back'
  docType: string
  onSide: (s: 'front' | 'back') => void
  onClose: () => void
}) {
  const available = ([['front', front], ['back', back]] as const).filter(([, f]) => f) as [('front' | 'back'), UploadedFile][]
  const sides = available.map(([s]) => s)
  const idx = sides.indexOf(side)
  const current = side === 'front' ? front : back

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (sides.length > 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const next = e.key === 'ArrowRight' ? (idx + 1) % sides.length : (idx - 1 + sides.length) % sides.length
        onSide(sides[next])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, sides, onClose, onSide])

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog" aria-modal="true" aria-label="Document preview"
        initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative w-full max-w-2xl rounded-[24px] bg-[#0B0F0D] text-white ring-1 ring-white/10 overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <span className="w-9 h-9 rounded-xl bg-white/[0.06] ring-1 ring-white/10 grid place-items-center flex-shrink-0">
            <FileText size={16} className="text-brand-secondary" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{docType}</p>
            <p className="text-xs text-white/50 truncate">{current?.name}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">Preview</span>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10 transition">
            <X size={17} />
          </button>
        </div>

        {sides.length > 1 && (
          <div className="flex gap-1 px-5 pt-4">
            {sides.map(s => (
              <button key={s} onClick={() => onSide(s)} className={`relative px-4 h-8 text-xs font-semibold rounded-full capitalize transition-colors ${side === s ? 'text-dark-base' : 'text-white/60 hover:text-white'}`}>
                {side === s && <motion.span layoutId="kyc-user-tab" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative m-5 rounded-2xl bg-black/40 ring-1 ring-white/[0.06] overflow-hidden grid place-items-center min-h-[280px]">
          <AnimatePresence mode="wait">
            {current?.preview
              ? (
                <motion.img
                  key={side}
                  src={current.preview}
                  alt={`${docType} — ${side}`}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="max-h-[62vh] w-auto object-contain"
                />
              )
              : (
                <div key="nopreview" className="py-16 text-center">
                  <FileText size={28} className="mx-auto text-white/40" />
                  <p className="mt-3 text-sm text-white/60">{current?.name ?? 'No preview available'}</p>
                  <p className="text-xs text-white/40 mt-1">PDFs can&apos;t be previewed here.</p>
                </div>
              )}
          </AnimatePresence>

          {sides.length > 1 && (
            <>
              <button onClick={() => onSide(sides[(idx - 1 + sides.length) % sides.length])} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 grid place-items-center text-white transition">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => onSide(sides[(idx + 1) % sides.length])} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 grid place-items-center text-white transition">
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        <p className="px-5 pb-5 text-xs text-white/45">Make sure every corner is visible and the text is sharp before you submit.</p>
      </motion.div>
    </motion.div>
  )
}

function StatusScreen({ icon: Icon, tone, title, body, perks, files }: {
  icon: React.ElementType
  tone: 'success' | 'pending'
  title: string
  body: string
  perks?: string[]
  files?: UploadedFile[]
}) {
  const ok = tone === 'success'
  return (
    <div>
      <TopBar title="Verification" verified={ok} />
      <div className="px-4 sm:px-8 py-10 sm:py-16">
        <Reveal>
          <Card className="relative overflow-hidden max-w-lg mx-auto px-8 py-12 text-center">
            <div className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[90px] ${ok ? 'bg-brand-primary/15' : 'bg-amber-400/15'}`} />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="relative mx-auto w-20 h-20"
            >
              <span className={`absolute inset-0 rounded-full animate-ping [animation-iteration-count:2] ${ok ? 'bg-brand-primary/15' : 'bg-amber-400/20'}`} />
              <span className={`relative w-20 h-20 rounded-full grid place-items-center shadow-lg ${ok ? 'bg-brand-primary shadow-brand-primary/30' : 'bg-amber-500 shadow-amber-500/30'}`}>
                <Icon size={34} strokeWidth={2} className="text-white" />
              </span>
            </motion.div>
            <h2 className="relative mt-7 text-2xl font-semibold tracking-tight text-dark-base dark:text-white">{title}</h2>
            <p className="relative mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>

            {perks && (
              <ul className="relative mt-6 space-y-2 text-left max-w-xs mx-auto">
                {perks.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: EASE }}
                    className="flex items-center gap-2.5 text-sm text-dark-base dark:text-white"
                  >
                    <ShieldCheck size={16} className="text-brand-primary flex-shrink-0" /> {p}
                  </motion.li>
                ))}
              </ul>
            )}

            {files && files.length > 0 && (
              <div className="relative mt-6 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] divide-y divide-black/[0.06] dark:divide-white/[0.07] text-left">
                {files.map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <FileText size={15} className="text-slate-400" />
                    <span className="flex-1 truncate font-medium text-dark-base dark:text-white">{f.name}</span>
                    <span className="text-xs text-slate-500">{f.size}</span>
                  </div>
                ))}
              </div>
            )}

            <Link href="/dashboard" className="relative mt-8 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition">
              Back to overview <ArrowRight size={15} />
            </Link>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Loader2, Pencil, Check, ShieldCheck, ShieldAlert, ShieldOff, ChevronRight,
  Mail, CalendarDays, Layers, User, MapPin, Copy,
} from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { Card, inputCls, ErrorNote } from '@/components/dashboard/ui'
import { Money, Reveal, CountUp, EASE } from '@/components/dashboard/motion'
import { DEMO_MODE, DEMO_PROFILE } from '@/lib/demo'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize',
  'Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Cambodia','Cameroon','Canada','Chile','China','Colombia','Congo',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Georgia',
  'Germany','Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland',
  'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Latvia','Lebanon','Libya','Lithuania',
  'Luxembourg','Malaysia','Maldives','Mali','Malta','Mexico','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','Norway','Oman','Pakistan',
  'Palestine','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania',
  'Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

interface Profile {
  full_name:     string
  email:         string
  gender:        string
  date_of_birth: string
  phone:         string
  country:       string
  state:         string
  address:       string
  plan:          string
  kyc_status:    string
  balance:       number
  profit:        number
  created_at:    string
}

type Editable = 'full_name' | 'gender' | 'date_of_birth' | 'phone' | 'country' | 'state' | 'address'

const EDITABLE: Editable[] = ['full_name', 'gender', 'date_of_birth', 'phone', 'country', 'state', 'address']

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export default function ProfilePage() {
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState<Partial<Profile>>({})

  useEffect(() => {
    async function load() {
      try {
        const data = DEMO_MODE ? DEMO_PROFILE : (await (await fetch('/api/profile')).json()).data
        setProfile(data)
        setForm(data)
      } catch { /* shows the error state */ }
      setLoading(false)
    }
    load()
  }, [])

  function update(field: Editable, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const body = Object.fromEntries(EDITABLE.map(k => [k, form[k]]))

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 600))
      setProfile(p => ({ ...p!, ...body }))
      finishSave()
      return
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const { data } = await res.json()
      setProfile(p => ({ ...p!, ...data }))
      finishSave()
    } else {
      const { error: e } = await res.json()
      setError(e ?? 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  function finishSave() {
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2800)
  }

  function handleCancel() {
    setForm(profile ?? {})
    setEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="flex items-center justify-center h-72">
          <Loader2 size={22} className="animate-spin text-brand-primary" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="px-4 sm:px-8 py-10 max-w-5xl mx-auto">
          <ErrorNote>Could not load your profile. Please refresh the page.</ErrorNote>
        </div>
      </div>
    )
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase()

  const filled = EDITABLE.filter(k => String(profile[k] ?? '').trim()).length
  const completeness = Math.round((filled / EDITABLE.length) * 100)
  const hasPlan = profile.plan && profile.plan !== 'None'

  return (
    <div>
      <TopBar title="Profile" verified={profile.kyc_status === 'Verified'} />

      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto space-y-6 pb-32">

        {/* Identity hero */}
        <Reveal>
          <section className="relative overflow-hidden rounded-[28px] bg-[#0B0F0D] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <div className="pointer-events-none absolute -top-40 -right-24 w-[520px] h-[520px] rounded-full bg-brand-primary/20 blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_100%]" />

            <div className="relative p-6 sm:p-9">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                  className="relative w-20 h-20 flex-shrink-0"
                >
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand-secondary to-brand-primary/20 opacity-70 blur-[2px]" />
                  <span className="relative w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-[#034d2a] grid place-items-center text-2xl font-semibold tracking-tight ring-4 ring-[#0B0F0D]">
                    {initials}
                  </span>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">{profile.full_name || 'Your profile'}</h1>
                  <p className="mt-1 text-sm text-white/55 truncate">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <KycPill status={profile.kyc_status} />
                    {hasPlan && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                        <Layers size={12} /> {profile.plan} plan
                      </span>
                    )}
                  </div>
                </div>

                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="self-start sm:self-center inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-dark-base text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition"
                  >
                    <Pencil size={14} /> Edit profile
                  </button>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden bg-white/[0.07]">
                <HeroStat label="Balance"><Money usd={profile.balance} /></HeroStat>
                <HeroStat label="Total profit"><span className="text-brand-secondary"><Money usd={profile.profit} sign="+" /></span></HeroStat>
                <HeroStat label="Member since" className="col-span-2 sm:col-span-1">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </HeroStat>
              </div>
            </div>
          </section>
        </Reveal>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 rounded-2xl bg-brand-primary/[0.08] ring-1 ring-brand-primary/25 px-4 py-3 text-sm font-medium text-brand-primary"
            >
              <span className="w-5 h-5 rounded-full bg-brand-primary grid place-items-center"><Check size={12} strokeWidth={3} className="text-white" /></span>
              Profile updated
            </motion.div>
          )}
        </AnimatePresence>
        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Editable details */}
          <div className="lg:col-span-2 space-y-6">
            <Reveal delay={0.08}>
              <Section icon={User} title="Personal information" editing={editing}>
                <Field label="Full name" editing={editing} value={profile.full_name}>
                  <input className={inputCls} value={form.full_name ?? ''} onChange={e => update('full_name', e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Gender" editing={editing} value={profile.gender}>
                  <select className={inputCls} value={form.gender ?? ''} onChange={e => update('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Date of birth" editing={editing} value={profile.date_of_birth ? longDate(profile.date_of_birth) : ''}>
                  <input type="date" className={inputCls} value={form.date_of_birth ?? ''} onChange={e => update('date_of_birth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </Field>
                <Field label="Phone number" editing={editing} value={profile.phone}>
                  <input type="tel" className={inputCls} value={form.phone ?? ''} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                </Field>
              </Section>
            </Reveal>

            <Reveal delay={0.14}>
              <Section icon={MapPin} title="Address" editing={editing}>
                <Field label="Country" editing={editing} value={profile.country}>
                  <select className={inputCls} value={form.country ?? ''} onChange={e => update('country', e.target.value)}>
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="State / province" editing={editing} value={profile.state}>
                  <input className={inputCls} value={form.state ?? ''} onChange={e => update('state', e.target.value)} placeholder="e.g. California" />
                </Field>
                <Field label="Street address" editing={editing} value={profile.address} wide>
                  <input className={inputCls} value={form.address ?? ''} onChange={e => update('address', e.target.value)} placeholder="Street address" />
                </Field>
              </Section>
            </Reveal>
          </div>

          {/* Side rail */}
          <div className="space-y-6">
            <Reveal delay={0.12}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Profile completeness</p>
                  <p className="text-sm font-semibold tabular-nums text-dark-base dark:text-white"><CountUp value={completeness} suffix="%" /></p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-black/[0.05] dark:bg-white/[0.07] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {completeness === 100 ? 'Everything’s filled in. Nice.' : 'Complete your details to speed up verification and payouts.'}
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.18}>
              <Card className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                <RailLink href="/dashboard/kyc" icon={profile.kyc_status === 'Verified' ? ShieldCheck : ShieldAlert} title="Identity verification" value={profile.kyc_status === 'None' ? 'Not started' : profile.kyc_status} tone={profile.kyc_status} />
                <RailLink href="/dashboard/plans" icon={Layers} title="Investment plan" value={hasPlan ? profile.plan : 'No plan'} />
                <RailRow icon={Mail} title="Email" value={profile.email} note="Contact support to change" copy />
                <RailRow icon={CalendarDays} title="Joined" value={longDate(profile.created_at)} />
              </Card>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-4 sm:bottom-6 left-4 right-20 lg:left-[calc(260px+2rem)] lg:right-24 z-30"
          >
            <div className="max-w-6xl mx-auto flex items-center gap-3 rounded-full bg-dark-base/95 dark:bg-white/95 backdrop-blur-xl pl-5 pr-2 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <p className="flex-1 text-sm text-white/70 dark:text-dark-base/70 truncate">You&apos;re editing your profile</p>
              <button onClick={handleCancel} disabled={saving} className="h-10 px-4 rounded-full text-sm font-semibold text-white dark:text-dark-base hover:bg-white/10 dark:hover:bg-black/5 transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="h-10 px-5 rounded-full bg-brand-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-brand-dim active:scale-[0.97] transition disabled:opacity-60">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving</> : <><Check size={15} /> Save changes</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function KycPill({ status }: { status: string }) {
  const cfg =
    status === 'Verified' ? { icon: ShieldCheck, cls: 'bg-brand-primary/15 text-brand-secondary', label: 'Verified' } :
    status === 'Pending'  ? { icon: ShieldAlert, cls: 'bg-amber-400/15 text-amber-300',          label: 'Verification pending' } :
                            { icon: ShieldOff,   cls: 'bg-white/10 text-white/70',                label: 'Not verified' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
      <cfg.icon size={12} /> {cfg.label}
    </span>
  )
}

function HeroStat({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0B0F0D] px-5 py-4 ${className}`}>
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-lg sm:text-xl font-semibold tracking-tight tabular-nums">{children}</p>
    </div>
  )
}

function Section({ icon: Icon, title, editing, children }: {
  icon: React.ElementType
  title: string
  editing: boolean
  children: React.ReactNode
}) {
  return (
    <Card className={`transition-shadow ${editing ? 'ring-2 ring-brand-primary/30' : ''}`}>
      <div className="flex items-center gap-3 px-6 pt-5 pb-1">
        <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center">
          <Icon size={16} className="text-slate-600 dark:text-slate-300" />
        </span>
        <h2 className="text-[15px] font-semibold text-dark-base dark:text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">{children}</div>
    </Card>
  )
}

function Field({ label, value, editing, wide, children }: {
  label: string
  value: string
  editing: boolean
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
            {children}
          </motion.div>
        ) : (
          <motion.p
            key="view"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`h-12 flex items-center text-[15px] ${value ? 'text-dark-base dark:text-white' : 'text-slate-400'}`}
          >
            {value || 'Not added'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function RailLink({ href, icon: Icon, title, value, tone }: {
  href: string
  icon: React.ElementType
  title: string
  value: string
  tone?: string
}) {
  const toneCls =
    tone === 'Verified' ? 'text-brand-primary' :
    tone === 'Pending'  ? 'text-amber-600 dark:text-amber-400' :
    tone === 'None'     ? 'text-rose-600 dark:text-rose-400' :
                          'text-dark-base dark:text-white'
  return (
    <Link href={href} className="group flex items-center gap-3.5 px-6 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition first:rounded-t-3xl">
      <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center flex-shrink-0">
        <Icon size={16} className="text-slate-600 dark:text-slate-300" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-[15px] font-semibold ${toneCls}`}>{value}</p>
      </div>
      <ChevronRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5" />
    </Link>
  )
}

function RailRow({ icon: Icon, title, value, note, copy }: {
  icon: React.ElementType
  title: string
  value: string
  note?: string
  copy?: boolean
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-3.5 px-6 py-4">
      <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] grid place-items-center flex-shrink-0">
        <Icon size={16} className="text-slate-600 dark:text-slate-300" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-[15px] font-medium text-dark-base dark:text-white truncate">{value}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
      </div>
      {copy && (
        <button
          onClick={() => { navigator.clipboard?.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          aria-label={`Copy ${title}`}
          className="w-8 h-8 rounded-full grid place-items-center text-slate-400 hover:text-dark-base dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          {copied ? <Check size={14} className="text-brand-primary" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  )
}

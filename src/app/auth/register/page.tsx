'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EASE } from '@/components/dashboard/motion'

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

const field = 'h-12 w-full rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.08] px-4 text-[15px] text-dark-base dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-primary focus:bg-white dark:focus:bg-white/[0.06]'
const label = 'block text-sm font-medium text-dark-base dark:text-white mb-1.5'
const errCls = 'mt-1.5 text-xs text-rose-500'

type Step = 1 | 2

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    gender: '', dateOfBirth: '', country: '', state: '', address: '', phone: '',
  })
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [terms,       setTerms]       = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  function update(fieldName: string, value: string) {
    setForm(p => ({ ...p, [fieldName]: value }))
    setErrors(p => ({ ...p, [fieldName]: '' }))
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim())    e.fullName        = 'Full name is required.'
    if (!form.email.trim())       e.email           = 'Email is required.'
    if (form.password.length < 8) e.password        = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    return e
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!form.gender)       e.gender      = 'Please select a gender.'
    if (!form.dateOfBirth)  e.dateOfBirth = 'Date of birth is required.'
    if (!form.country)      e.country     = 'Please select a country.'
    if (!form.phone.trim()) e.phone       = 'Phone number is required.'
    if (!terms)             e.terms       = 'You must accept the terms.'
    return e
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateStep1()
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateStep2()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }

    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInErr) { setError(signInErr.message); setLoading(false); return }
    }

    if (data.user) {
      await supabase.from('profiles').update({
        gender:        form.gender,
        date_of_birth: form.dateOfBirth,
        country:       form.country,
        state:         form.state,
        address:       form.address,
        phone:         form.phone,
      }).eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-dark-base dark:text-white">Create your account</h1>
        <p className="mt-1.5 text-[15px] text-slate-500 dark:text-slate-400">Start investing in a couple of minutes.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-7">
        {([1, 2] as Step[]).map(s => {
          const done = step > s, active = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-semibold transition-colors ${
                done ? 'bg-brand-primary text-white' : active ? 'bg-dark-base text-white dark:bg-white dark:text-dark-base' : 'ring-1 ring-black/15 dark:ring-white/20 text-slate-400'
              }`}>
                {done ? <Check size={12} strokeWidth={3} /> : s}
              </span>
              <span className={`text-sm font-medium ${active || done ? 'text-dark-base dark:text-white' : 'text-slate-400'}`}>
                {s === 1 ? 'Account' : 'Details'}
              </span>
              {s < 2 && (
                <span className="relative mx-1 h-px w-8 bg-black/15 dark:bg-white/15 overflow-hidden">
                  <motion.span className="absolute inset-0 bg-brand-primary origin-left" initial={false} animate={{ scaleX: step > 1 ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE }} />
                </span>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-rose-500/[0.07] ring-1 ring-rose-500/25 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.form
            key="step1"
            onSubmit={handleNext}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <div>
              <label className={label}>Full name</label>
              <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Jane Doe" autoComplete="name" className={field} />
              {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
            </div>
            <div>
              <label className={label}>Email address</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" className={field} />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>
            <div>
              <label className={label}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" className={`${field} pr-11`} />
                <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className={errCls}>{errors.password}</p>}
            </div>
            <div>
              <label className={label}>Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter password" autoComplete="new-password" className={`${field} pr-11`} />
                <button type="button" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && <p className={errCls}>{errors.confirmPassword}</p>}
            </div>
            <button type="submit" className="w-full h-12 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition">
              Continue <ArrowRight size={16} />
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <div>
              <label className={label}>Gender</label>
              <select value={form.gender} onChange={e => update('gender', e.target.value)} className={field}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <p className={errCls}>{errors.gender}</p>}
            </div>
            <div>
              <label className={label}>Date of birth</label>
              <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} className={field} />
              {errors.dateOfBirth && <p className={errCls}>{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className={label}>Phone number</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" autoComplete="tel" className={field} />
              {errors.phone && <p className={errCls}>{errors.phone}</p>}
            </div>
            <div>
              <label className={label}>Country</label>
              <select value={form.country} onChange={e => update('country', e.target.value)} className={field}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className={errCls}>{errors.country}</p>}
            </div>
            <div>
              <label className={label}>State / province <span className="font-normal text-slate-400">(optional)</span></label>
              <input type="text" value={form.state} onChange={e => update('state', e.target.value)} placeholder="e.g. California" className={field} />
            </div>
            <div>
              <label className={label}>Address <span className="font-normal text-slate-400">(optional)</span></label>
              <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street address" autoComplete="street-address" className={field} />
            </div>
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: '' })) }} className="mt-0.5 w-4 h-4 rounded accent-brand-primary flex-shrink-0" />
                <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  I agree to the <Link href="#" className="text-brand-primary hover:text-brand-dim font-medium">Terms of Service</Link> and <Link href="#" className="text-brand-primary hover:text-brand-dim font-medium">Privacy Policy</Link>.
                </span>
              </label>
              {errors.terms && <p className={errCls}>{errors.terms}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} aria-label="Back" className="h-12 px-5 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold text-dark-base dark:text-white inline-flex items-center justify-center hover:ring-black/25 dark:hover:ring-white/30 active:scale-[0.98] transition">
                <ArrowLeft size={16} />
              </button>
              <button type="submit" disabled={loading} className="flex-1 h-12 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition">
                {loading ? <><Loader2 size={17} className="animate-spin" /> Creating…</> : <>Create account <ArrowRight size={16} /></>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-brand-primary hover:text-brand-dim font-semibold transition-colors">Sign in</Link>
      </p>
    </div>
  )
}

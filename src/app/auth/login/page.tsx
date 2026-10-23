'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const field = 'h-12 w-full rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/[0.08] dark:ring-white/[0.08] px-4 text-[15px] text-dark-base dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-brand-primary focus:bg-white dark:focus:bg-white/[0.06]'
const label = 'block text-sm font-medium text-dark-base dark:text-white mb-1.5'

export default function LoginPage() {
  const router      = useRouter()
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    localStorage.setItem('bit-tesla-remember', rememberMe ? 'true' : 'false')
    if (!rememberMe) {
      sessionStorage.setItem('bit-tesla-session', 'true')
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-dark-base dark:text-white">Welcome back</h1>
        <p className="mt-1.5 text-[15px] text-slate-500 dark:text-slate-400">Sign in to pick up where you left off.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-rose-500/[0.07] ring-1 ring-rose-500/25 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={field}
          />
        </div>

        <div>
          <label className={label}>Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={`${field} pr-11`}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-primary flex-shrink-0"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-sm text-brand-primary hover:text-brand-dim transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition"
        >
          {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-brand-primary hover:text-brand-dim font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}

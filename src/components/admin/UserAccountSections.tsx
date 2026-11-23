'use client'

import { useState } from 'react'
import { Loader2, Check, X, Eye, EyeOff, KeyRound, Mail, UserRound, Wand2, Copy, Edit2 } from 'lucide-react'

export interface AccountProfile {
  id: string
  full_name: string
  email: string
  gender?: string | null
  date_of_birth?: string | null
  phone?: string | null
  country?: string
  state?: string | null
  address?: string | null
  plan: string
  kyc_status: string
  created_at: string
}

export interface AuthInfo {
  email: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

const label = 'block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5'
const input = 'w-full px-3 py-2.5 border border-light-border dark:border-dark-border bg-light-base dark:bg-dark-card text-dark-base dark:text-white text-sm focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 disabled:opacity-60'
const primaryBtn = 'inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-dim disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors'
const ghostBtn = 'inline-flex items-center gap-1.5 px-4 py-2.5 border border-light-border dark:border-dark-border text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-light-surface dark:hover:bg-dark-surface transition-colors'

function fmtDateTime(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const buf = new Uint32Array(14)
  crypto.getRandomValues(buf)
  return Array.from(buf, n => chars[n % chars.length]).join('')
}

/** PATCHes the user; returns the updated profile or an error message. */
async function patchUser(userId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { error: (json?.error as string) ?? 'Update failed. Please try again.' }
  return { profile: json.data as AccountProfile }
}

/* ─── Login details ─────────────────────────────────────────────────────── */

export function LoginDetailsSection({ userId, profile, auth, onProfile, onAuth }: {
  userId: string
  profile: AccountProfile
  auth: AuthInfo | null
  onProfile: (p: AccountProfile) => void
  onAuth: (a: Partial<AuthInfo>) => void
}) {
  const currentEmail = auth?.email || profile.email
  const [emailDraft, setEmailDraft] = useState<string | null>(null) // null = untouched
  const email = emailDraft ?? currentEmail
  const setEmail = setEmailDraft
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState<'' | 'email' | 'password'>('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function saveEmail() {
    setBusy('email'); setMsg(null)
    const r = await patchUser(userId, { email })
    setBusy('')
    if (r.error) return setMsg({ kind: 'err', text: r.error })
    if (r.profile) { onProfile(r.profile); onAuth({ email: r.profile.email }) }
    setEmailDraft(null)
    setMsg({ kind: 'ok', text: 'Email updated. The user must now sign in with the new address.' })
  }

  async function savePassword() {
    setBusy('password'); setMsg(null)
    const r = await patchUser(userId, { password })
    setBusy('')
    if (r.error) return setMsg({ kind: 'err', text: r.error })
    setMsg({ kind: 'ok', text: 'Password changed. Share the new password with the user — it is not stored and cannot be shown again.' })
  }

  async function copyPw() {
    try { await navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  const emailDirty = email.trim().toLowerCase() !== currentEmail.toLowerCase()

  return (
    <section className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
      <div className="px-5 py-4 border-b border-light-border dark:border-dark-border flex items-center gap-2">
        <KeyRound size={15} className="text-brand-primary" />
        <h2 className="text-sm font-bold text-dark-base dark:text-white">Login Details</h2>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className={label}>Last sign-in</p>
            <p className="text-dark-base dark:text-white">{fmtDateTime(auth?.last_sign_in_at ?? null)}</p>
          </div>
          <div>
            <p className={label}>Email status</p>
            <p className="text-dark-base dark:text-white">{auth?.email_confirmed_at ? `Confirmed ${fmtDateTime(auth.email_confirmed_at)}` : 'Not confirmed'}</p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={label}><Mail size={11} className="inline -mt-0.5 mr-1" />Login email</label>
          <div className="flex gap-2 flex-wrap">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${input} flex-1 min-w-[220px]`} />
            <button onClick={saveEmail} disabled={!emailDirty || busy === 'email'} className={primaryBtn}>
              {busy === 'email' ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Update email</>}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={label}>Password</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Passwords are stored as one-way encrypted hashes, so the current password can&apos;t be viewed by anyone — including admins.
            Set a new one below and share it with the user.
          </p>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                autoComplete="new-password"
                className={`${input} pr-10 font-mono`}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="button" onClick={() => { setPassword(randomPassword()); setShowPw(true) }} className={ghostBtn}>
              <Wand2 size={13} /> Generate
            </button>
            {password && (
              <button type="button" onClick={copyPw} className={ghostBtn}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            )}
            <button onClick={savePassword} disabled={password.length < 8 || busy === 'password'} className={primaryBtn}>
              {busy === 'password' ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Set password</>}
            </button>
          </div>
        </div>

        {msg && (
          <p className={`text-xs font-semibold ${msg.kind === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-primary'}`}>{msg.text}</p>
        )}
      </div>
    </section>
  )
}

/* ─── Profile information ───────────────────────────────────────────────── */

const FIELDS: { key: keyof AccountProfile; label: string; type?: 'text' | 'date' | 'select'; options?: string[]; wide?: boolean }[] = [
  { key: 'full_name', label: 'Full name' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
  { key: 'date_of_birth', label: 'Date of birth', type: 'date' },
  { key: 'phone', label: 'Phone' },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State / Region' },
  { key: 'address', label: 'Address', wide: true },
]

export function ProfileInfoSection({ userId, profile, onProfile }: {
  userId: string
  profile: AccountProfile
  onProfile: (p: AccountProfile) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function start() {
    const d: Record<string, string> = {}
    for (const f of FIELDS) d[f.key] = (profile[f.key] as string | null | undefined) ?? ''
    setDraft(d); setError(''); setEditing(true)
  }

  async function save() {
    setBusy(true); setError('')
    const r = await patchUser(userId, draft)
    setBusy(false)
    if (r.error) return setError(r.error)
    if (r.profile) onProfile(r.profile)
    setEditing(false)
  }

  return (
    <section className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
      <div className="px-5 py-4 border-b border-light-border dark:border-dark-border flex items-center gap-2">
        <UserRound size={15} className="text-brand-primary" />
        <h2 className="text-sm font-bold text-dark-base dark:text-white">Profile Information</h2>
        {!editing && (
          <button onClick={start} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-colors">
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
              <label className={label}>{f.label}</label>
              {editing ? (
                f.type === 'select' ? (
                  <select value={draft[f.key] ?? ''} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} className={input}>
                    {f.options!.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                  </select>
                ) : (
                  <input type={f.type ?? 'text'} value={draft[f.key] ?? ''} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} className={input} />
                )
              ) : (
                <p className="text-sm text-dark-base dark:text-white min-h-[1.25rem]">{(profile[f.key] as string | null | undefined) || <span className="text-slate-400">—</span>}</p>
              )}
            </div>
          ))}
          <div>
            <label className={label}>Plan</label>
            <p className="text-sm text-dark-base dark:text-white">{profile.plan}</p>
          </div>
          <div>
            <label className={label}>KYC status</label>
            <p className="text-sm text-dark-base dark:text-white">{profile.kyc_status}</p>
          </div>
          <div>
            <label className={label}>User ID</label>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">{profile.id}</p>
          </div>
        </div>

        {error && <p className="mt-4 text-xs font-semibold text-brand-primary">{error}</p>}

        {editing && (
          <div className="flex gap-2 mt-5">
            <button onClick={save} disabled={busy} className={primaryBtn}>
              {busy ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Save changes</>}
            </button>
            <button onClick={() => setEditing(false)} disabled={busy} className={ghostBtn}><X size={13} /> Cancel</button>
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Upload, Trash2, Award } from 'lucide-react'

interface Certificate { id: string; title: string; issuer?: string; image_url: string }

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await fetch('/api/admin/certificates').then(r => r.json()).catch(() => ({ data: [] }))
    setCerts(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function flash(m: string) { setNotice(m); setTimeout(() => setNotice(''), 3000) }

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !file) { flash('Add a title and choose an image.'); return }
    setBusy(true)
    const form = new FormData()
    form.append('title', title.trim())
    form.append('issuer', issuer.trim())
    form.append('file', file)
    const res = await fetch('/api/admin/certificates', { method: 'POST', body: form })
    if (res.ok) {
      setTitle(''); setIssuer(''); setFile(null); if (fileRef.current) fileRef.current.value = ''
      await load()
    } else {
      flash((await res.json()).error ?? 'Upload failed.')
    }
    setBusy(false)
  }

  async function remove(id: string) {
    const prev = certs
    setCerts(c => c.filter(x => x.id !== id))
    const res = await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE' })
    if (!res.ok) { setCerts(prev); flash((await res.json()).error ?? 'Could not delete.') }
  }

  const input = 'w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-dark-base dark:text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:border-brand-primary'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-base dark:text-white">Certificates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Upload certificates to display on the landing page.</p>
        </div>
        {notice && <span className="text-xs font-semibold px-3 py-1.5 bg-amber-400/15 text-amber-700 dark:text-amber-400 rounded">{notice}</span>}
      </div>

      {/* Upload */}
      <form onSubmit={upload} className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-5 space-y-3">
        <p className="text-sm font-bold text-dark-base dark:text-white">Add a certificate</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. ISO 9001:2015)" className={input} />
          <input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="Issuer (optional)" className={input} />
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-dim" />
        <button type="submit" disabled={busy}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-dim disabled:opacity-60 text-white rounded-lg transition-colors">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <><Upload size={13} /> Upload certificate</>}
        </button>
      </form>

      {/* List */}
      <div className="bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
        <div className="px-5 py-4 border-b border-light-border dark:border-dark-border flex items-center gap-2">
          <Award size={15} className="text-brand-primary" />
          <h2 className="text-sm font-bold text-dark-base dark:text-white">Uploaded</h2>
          <span className="text-xs text-slate-500">{certs.length}</span>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 size={20} className="animate-spin text-brand-primary" /></div>
        ) : certs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No certificates yet. Upload one above — the landing page shows placeholder slots until then.</p>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {certs.map(c => (
              <div key={c.id} className="rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image_url} alt={c.title} className="w-full h-32 object-contain bg-white p-2" />
                <div className="px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-dark-base dark:text-white truncate">{c.title}</p>
                    {c.issuer && <p className="text-[11px] text-slate-500 truncate">{c.issuer}</p>}
                  </div>
                  <button onClick={() => remove(c.id)} aria-label="Delete" className="w-7 h-7 rounded grid place-items-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

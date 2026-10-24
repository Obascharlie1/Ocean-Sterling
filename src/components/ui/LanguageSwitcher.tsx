'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Check, ChevronDown, Search, Languages } from 'lucide-react'
import { LANGUAGES, getLanguage, storedLang, applyLanguage } from '@/lib/i18n'
import { DEMO_MODE } from '@/lib/demo'

const noop = () => () => {}

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const code = useSyncExternalStore(noop, storedLang, () => 'en')
  const current = getLanguage(code)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) { setOpen(false); setQuery('') }
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const q = query.trim().toLowerCase()
  const filtered = q ? LANGUAGES.filter(l => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)) : LANGUAGES

  async function choose(next: string) {
    setOpen(false)
    if (next === code) return
    if (!DEMO_MODE) {
      try { await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: next }) }) } catch { /* ignore */ }
    }
    applyLanguage(next) // reloads to translate
  }

  const btnCls = onDark
    ? 'h-9 px-2.5 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] text-xs font-semibold text-white/85 hover:bg-white/[0.12] transition-colors'
    : 'h-8 px-2 flex items-center gap-1 border border-light-border dark:border-dark-border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-colors'

  return (
    <div className="relative notranslate" translate="no" ref={wrapperRef}>
      <button onClick={() => { setQuery(''); setOpen(o => !o) }} aria-haspopup="listbox" aria-expanded={open} aria-label={`Language: ${current.name}`} className={btnCls}>
        <Languages size={14} />
        <span className="uppercase">{current.code.split('-')[0]}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-64 bg-light-base dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
          <div className="p-2 border-b border-light-border dark:border-dark-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search language…" aria-label="Search language"
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] text-sm text-dark-base dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-primary" />
            </div>
          </div>
          <ul role="listbox" aria-label="Language" className="py-1.5 max-h-72 overflow-y-auto">
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-400">No match</li>}
            {filtered.map(l => {
              const active = l.code === code
              return (
                <li key={l.code}>
                  <button role="option" aria-selected={active} onClick={() => choose(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${active ? 'bg-brand-primary/[0.06] text-dark-base dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'}`}>
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="flex-1 min-w-0 truncate">{l.name}</span>
                    {active && <Check size={14} className="text-brand-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="px-4 py-2.5 border-t border-light-border dark:border-dark-border text-[11px] leading-snug text-slate-400">
            Translates the whole app. Powered by Google Translate.
          </p>
        </div>
      )}
    </div>
  )
}

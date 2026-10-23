'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  type Trader, type BotConfig, type CopyPosition, type BotSettings,
  DEFAULT_BOT_CONFIG,
} from '@/lib/trading'

/*
 * Admin-managed data (traders, bot config) comes from the API, which serves
 * demo seeds when Supabase isn't configured. A user's own copies and bot
 * settings are kept in localStorage so the demo feels real within a session.
 */

const POSITIONS_KEY = 'copy-positions'
const BOT_KEY = 'ai-bot-settings'

const DEFAULT_BOT_SETTINGS: BotSettings = { enabled: false, risk: 'Balanced', allocation: 0, startedAt: null }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch { return fallback }
}

function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

/** Active traders from the admin-managed catalog. */
export function useTraders() {
  const [traders, setTraders] = useState<Trader[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetch('/api/copy-traders')
      .then(r => r.json())
      .then(({ data }) => { if (alive) { setTraders(data ?? []); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return { traders, loading }
}

export function useBotConfig() {
  const [config, setConfig] = useState<BotConfig>(DEFAULT_BOT_CONFIG)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    fetch('/api/ai-bot-config')
      .then(r => r.json())
      .then(d => { if (alive) { setConfig({ ...DEFAULT_BOT_CONFIG, ...d }); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return { config, loading }
}

export function useCopyPositions() {
  const [positions, setPositions] = useState<CopyPosition[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => { setPositions(readJSON<CopyPosition[]>(POSITIONS_KEY, [])); setReady(true) }, [])

  const persist = useCallback((next: CopyPosition[]) => {
    setPositions(next)
    writeJSON(POSITIONS_KEY, next)
  }, [])

  const copy = useCallback((traderId: string, amount: number) => {
    setPositions(prev => {
      const existing = prev.find(p => p.traderId === traderId && p.status === 'Active')
      const next = existing
        ? prev.map(p => p.id === existing.id ? { ...p, amount: p.amount + amount } : p)
        : [...prev, { id: `cp-${Date.now()}`, traderId, amount, startedAt: new Date().toISOString(), status: 'Active' as const }]
      writeJSON(POSITIONS_KEY, next)
      return next
    })
  }, [])

  const stop = useCallback((id: string) => {
    setPositions(prev => {
      const next = prev.filter(p => p.id !== id)
      writeJSON(POSITIONS_KEY, next)
      return next
    })
  }, [])

  return { positions, ready, copy, stop, persist }
}

export function useBotSettings() {
  const [settings, setSettings] = useState<BotSettings>(DEFAULT_BOT_SETTINGS)
  const [ready, setReady] = useState(false)

  useEffect(() => { setSettings(readJSON<BotSettings>(BOT_KEY, DEFAULT_BOT_SETTINGS)); setReady(true) }, [])

  const update = useCallback((patch: Partial<BotSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      // Stamp a start time when the bot is switched on.
      if (patch.enabled && !prev.enabled) next.startedAt = new Date().toISOString()
      if (patch.enabled === false) next.startedAt = null
      writeJSON(BOT_KEY, next)
      return next
    })
  }, [])

  return { settings, ready, update }
}

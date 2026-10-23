/*
 * Copy trading + AI bot — shared types, demo seed data and simulation helpers.
 * Admin-managed catalog (traders, bot config) is DB-backed in real mode and
 * falls back to the seeds below in demo mode. A user's own copies and bot
 * settings live client-side (see tradingStore.ts).
 */

export type RiskLevel = 'Low' | 'Medium' | 'High'
export type BotRisk = 'Conservative' | 'Balanced' | 'Aggressive'

export interface Trader {
  id: string
  name: string
  handle: string
  strategy: string
  risk: RiskLevel
  monthly_return: number // %
  win_rate: number       // %
  followers: number
  spark: number[]
  is_active: boolean
  featured: boolean
}

export interface CopyPosition {
  id: string
  traderId: string
  amount: number         // USD allocated
  startedAt: string      // ISO
  status: 'Active' | 'Stopped'
}

export interface BotSettings {
  enabled: boolean
  risk: BotRisk
  allocation: number     // USD
  startedAt: string | null
}

export interface BotConfig {
  platform_enabled: boolean
  min_allocation: number
  daily_return_min: number // %
  daily_return_max: number // %
  win_rate: number         // %
}

export const RISK_META: Record<RiskLevel, { label: string; cls: string }> = {
  Low:    { label: 'Low risk',    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Medium: { label: 'Medium risk', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  High:   { label: 'High risk',   cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export const BOT_RISK_META: Record<BotRisk, { desc: string; multiplier: number }> = {
  Conservative: { desc: 'Smaller, steadier gains. Tighter stop-losses.', multiplier: 0.55 },
  Balanced:     { desc: 'A measured mix of growth and protection.',       multiplier: 1 },
  Aggressive:   { desc: 'Chases higher returns with bigger swings.',      multiplier: 1.7 },
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
  platform_enabled: true,
  min_allocation: 100,
  daily_return_min: 0.4,
  daily_return_max: 1.8,
  win_rate: 87,
}

const spark = (seed: number) =>
  Array.from({ length: 12 }, (_, i) => 50 + Math.sin(i * 0.7 + seed) * 12 + i * (2 + seed))

export const DEMO_TRADERS: Trader[] = [
  { id: 'tr-nova',   name: 'Nova Quant',     handle: '@novaquant',   strategy: 'Momentum · Crypto majors',     risk: 'High',   monthly_return: 14.2, win_rate: 78, followers: 8421, spark: spark(1), is_active: true, featured: true },
  { id: 'tr-atlas',  name: 'Atlas Capital',  handle: '@atlascap',    strategy: 'Macro swing · Indices + FX',    risk: 'Medium', monthly_return: 8.6,  win_rate: 84, followers: 15230, spark: spark(2), is_active: true, featured: true },
  { id: 'tr-sage',   name: 'Sage Income',    handle: '@sageincome',  strategy: 'Low-vol dividend + bonds',      risk: 'Low',    monthly_return: 3.4,  win_rate: 91, followers: 22190, spark: spark(0.3), is_active: true, featured: false },
  { id: 'tr-orion',  name: 'Orion Futures',  handle: '@orionfut',    strategy: 'Trend-following · Commodities',  risk: 'High',   monthly_return: 11.8, win_rate: 72, followers: 5140, spark: spark(3), is_active: true, featured: false },
  { id: 'tr-vertex', name: 'Vertex Alpha',   handle: '@vertexalpha', strategy: 'Mean-reversion · Equities',     risk: 'Medium', monthly_return: 6.9,  win_rate: 86, followers: 9980, spark: spark(1.6), is_active: true, featured: false },
  { id: 'tr-delta',  name: 'Delta Neutral',  handle: '@deltaneutral',strategy: 'Market-neutral · Options',      risk: 'Low',    monthly_return: 2.8,  win_rate: 93, followers: 12040, spark: spark(0.8), is_active: true, featured: false },
]

/** Simulated running P/L for a copy position, grown from its start time. */
export function positionPnl(pos: CopyPosition, trader: Trader | undefined, now = Date.now()) {
  if (!trader) return 0
  const elapsedDays = Math.max(0, (now - new Date(pos.startedAt).getTime()) / 86_400_000)
  const monthly = trader.monthly_return / 100
  const base = pos.amount * monthly * (elapsedDays / 30)
  // Gentle live oscillation so the figure feels alive without being random per render.
  const wave = Math.sin(now / 9000 + pos.amount) * pos.amount * 0.0008
  return base + wave
}

/** Simulated bot P/L since it was switched on. */
export function botPnl(settings: BotSettings, config: BotConfig, now = Date.now()) {
  if (!settings.enabled || !settings.startedAt) return 0
  const elapsedDays = Math.max(0, (now - new Date(settings.startedAt).getTime()) / 86_400_000)
  const mid = (config.daily_return_min + config.daily_return_max) / 200 // avg daily as fraction
  const mult = BOT_RISK_META[settings.risk].multiplier
  const base = settings.allocation * mid * mult * elapsedDays
  const wave = Math.sin(now / 7000) * settings.allocation * 0.0006
  return base + wave
}

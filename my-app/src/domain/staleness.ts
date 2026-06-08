import type { ConfidenceLevel, ForecastMeta } from './types'

export type StalenessLevel = 'fresh' | 'stale' | 'very_stale'

const DAY_MS = 24 * 60 * 60 * 1000

export function getStaleness(
  generatedAt: string,
  ttlSeconds: number,
  now: Date,
): StalenessLevel {
  const ageMs = now.getTime() - new Date(generatedAt).getTime()
  if (ageMs > DAY_MS) return 'very_stale'
  if (ageMs > ttlSeconds * 1000) return 'stale'
  return 'fresh'
}

export function getStalenessFromMeta(meta: ForecastMeta, now: Date): StalenessLevel {
  return getStaleness(meta.generatedAt, meta.ttlSeconds, now)
}

/** @deprecated Use getStalenessFromMeta */
export function staleness(meta: ForecastMeta, now: Date): 'fresh' | 'stale' {
  const level = getStalenessFromMeta(meta, now)
  return level === 'fresh' ? 'fresh' : 'stale'
}

export function cappedConfidence(
  rawLevel: ConfidenceLevel,
  level: StalenessLevel,
): ConfidenceLevel {
  if (level === 'very_stale') return 'low'
  if (level === 'stale' && rawLevel === 'high') return 'fair'
  return rawLevel
}

export function minutesSince(meta: ForecastMeta, now: Date): number {
  const generated = new Date(meta.generatedAt).getTime()
  return Math.floor((now.getTime() - generated) / 60000)
}

export function hoursSince(meta: ForecastMeta, now: Date): number {
  return Math.floor(minutesSince(meta, now) / 60)
}

export function ageMs(generatedAt: string, now: Date): number {
  return now.getTime() - new Date(generatedAt).getTime()
}

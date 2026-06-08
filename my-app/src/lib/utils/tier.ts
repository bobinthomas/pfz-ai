import type { CatchTier, ConfidenceLevel } from '@/domain/types'

export function tierColor(tier: CatchTier): string {
  const map: Record<CatchTier, string> = {
    good: 'var(--good)',
    ok: 'var(--ok)',
    low: 'var(--low)',
    nodata: 'var(--nodata)',
  }
  return map[tier]
}

export function tierBg(tier: CatchTier): string {
  const map: Record<CatchTier, string> = {
    good: 'var(--good-bg)',
    ok: 'var(--ok-bg)',
    low: 'var(--low-bg)',
    nodata: 'var(--nodata-bg)',
  }
  return map[tier]
}

export function confidenceColor(level: ConfidenceLevel): string {
  const map: Record<ConfidenceLevel, string> = {
    high: 'var(--good)',
    fair: 'var(--low)',
    low: 'var(--nodata)',
  }
  return map[level]
}

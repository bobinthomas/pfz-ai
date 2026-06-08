import type { Boat, CatchTier, ConfidenceLevel, Zone } from './types'

export function isReachable(zone: Zone, boat: Boat): boolean {
  return zone.distanceKm <= boat.rangeKm
}

export function gearFits(zone: Zone, boat: Boat): boolean {
  if (!zone.gear?.length) return false
  return zone.gear.some((g) => boat.gear.includes(g))
}

export function rankScore(zone: Zone): number {
  const catchScore = zone.catch?.score ?? 0
  const confScore = zone.confidence?.score ?? 0
  return catchScore * 1000 + confScore
}

export function bestReachable(zones: Zone[], boat: Boat): Zone | null {
  const candidates = zones.filter(
    (z) => z.dataStatus === 'ok' && isReachable(z, boat) && z.catch,
  )
  if (candidates.length === 0) return null
  return candidates.reduce((best, z) =>
    rankScore(z) > rankScore(best) ? z : best,
  )
}

export function strongestOverall(zones: Zone[]): Zone | null {
  const candidates = zones.filter((z) => z.dataStatus === 'ok' && z.catch)
  if (candidates.length === 0) return null
  return candidates.reduce((best, z) =>
    rankScore(z) > rankScore(best) ? z : best,
  )
}

export function strongerOutOfRange(zones: Zone[], boat: Boat): boolean {
  const best = bestReachable(zones, boat)
  const strongest = strongestOverall(zones)
  if (!strongest || !best) return false
  if (isReachable(strongest, boat)) return false
  return rankScore(strongest) > rankScore(best)
}

export function sortZones(zones: Zone[], boat: Boat): Zone[] {
  const tier = (z: Zone) => {
    if (z.dataStatus === 'low_data') return 2
    if (!isReachable(z, boat)) return 1
    return 0
  }
  return [...zones].sort((a, b) => {
    const t = tier(a) - tier(b)
    if (t !== 0) return t
    if (a.dataStatus === 'low_data' || b.dataStatus === 'low_data') return 0
    return rankScore(b) - rankScore(a)
  })
}

export function catchHeadlineKey(tier: CatchTier): string {
  const map: Record<CatchTier, string> = {
    good: 'ch_good',
    ok: 'ch_ok',
    low: 'ch_low',
    nodata: 'ch_nodata',
  }
  return map[tier]
}

export function confidenceLabelKey(level: ConfidenceLevel): string {
  const map: Record<ConfidenceLevel, string> = {
    high: 's_high',
    fair: 's_fair',
    low: 's_low',
  }
  return map[level]
}

export function confidenceDots(level: ConfidenceLevel): number {
  const map: Record<ConfidenceLevel, number> = {
    high: 3,
    fair: 2,
    low: 1,
  }
  return map[level]
}

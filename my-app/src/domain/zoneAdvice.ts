import { sortZones } from './ranking'
import { cappedConfidence } from './staleness'
import type { StalenessLevel } from './staleness'
import type { Boat, CatchTier, ConfidenceLevel, Zone } from './types'

export type ZoneTabGroupKey = 'good' | 'ok' | 'low' | 'low_data'

const TAB_ORDER: ZoneTabGroupKey[] = ['good', 'ok', 'low', 'low_data']

export interface ZoneDisplayAdvice {
  catchTier: CatchTier
  displayConfidence: ConfidenceLevel | null
  mutedCatchPill: boolean
  tabGroupKey: ZoneTabGroupKey
}

export function displayConfidenceForZone(
  zone: Zone,
  staleness: StalenessLevel,
): ConfidenceLevel | null {
  const raw = zone.confidence?.level
  if (!raw) return null
  return staleness === 'fresh' ? raw : cappedConfidence(raw, staleness)
}

/** Tabs always group by catch tier — staleness only affects card confidence display. */
export function zoneTabGroupKey(zone: Zone): ZoneTabGroupKey {
  if (zone.dataStatus === 'low_data') return 'low_data'
  const tier = zone.catch?.tier
  if (tier === 'good' || tier === 'ok' || tier === 'low') return tier
  return 'low'
}

export function getZoneDisplayAdvice(
  zone: Zone,
  staleness: StalenessLevel,
): ZoneDisplayAdvice {
  const catchTier = zone.catch?.tier ?? 'nodata'
  return {
    catchTier,
    displayConfidence: displayConfidenceForZone(zone, staleness),
    mutedCatchPill: staleness !== 'fresh',
    tabGroupKey: zoneTabGroupKey(zone),
  }
}

export function groupZonesForTabs(zones: Zone[], boat: Boat) {
  const sorted = sortZones(zones, boat)
  return TAB_ORDER.flatMap((key) => {
    const inGroup = sorted.filter((z) => zoneTabGroupKey(z) === key)
    return inGroup.length ? [{ key, zones: inGroup }] : []
  })
}

export function zoneTabLabelKey(tabKey: ZoneTabGroupKey): string {
  if (tabKey === 'low_data') return 'noReading'
  const map: Record<'good' | 'ok' | 'low', string> = {
    good: 'goodFishing',
    ok: 'someFish',
    low: 'fewFish',
  }
  return map[tabKey]
}

export function zoneTabIndicatorDots(tabKey: ZoneTabGroupKey): number {
  if (tabKey === 'low_data') return 0
  return tabKey === 'good' ? 3 : tabKey === 'ok' ? 2 : 1
}

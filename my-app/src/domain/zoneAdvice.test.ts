import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Boat, Forecast, Zone } from './types'
import {
  getZoneDisplayAdvice,
  groupZonesForTabs,
  zoneTabGroupKey,
  zoneTabLabelKey,
} from './zoneAdvice'

const calmForecast = calm as Forecast
const staleForecast = stale as Forecast
const boat = calmForecast.boat as Boat

function zone(id: string): Zone {
  return calmForecast.zones.find((z) => z.id === id) as Zone
}

describe('zoneTabGroupKey', () => {
  it('always groups by catch tier regardless of staleness', () => {
    const munambam = zone('KL-712')
    expect(zoneTabGroupKey(munambam)).toBe('good')
    expect(zoneTabGroupKey(zone('KL-901'))).toBe('ok')
    expect(zoneTabLabelKey('good')).toBe('goodFishing')
  })
})

describe('getZoneDisplayAdvice', () => {
  it('keeps catch tab but caps confidence when very_stale', () => {
    const advice = getZoneDisplayAdvice(zone('KL-712'), 'very_stale')
    expect(advice.tabGroupKey).toBe('good')
    expect(advice.displayConfidence).toBe('low')
    expect(advice.mutedCatchPill).toBe(true)
  })

  it('shows full confidence when fresh', () => {
    const advice = getZoneDisplayAdvice(zone('KL-712'), 'fresh')
    expect(advice.displayConfidence).toBe('high')
    expect(advice.tabGroupKey).toBe('good')
    expect(advice.mutedCatchPill).toBe(false)
  })
})

describe('groupZonesForTabs', () => {
  it('always uses catch-tier tabs even for stale data', () => {
    const groups = groupZonesForTabs(staleForecast.zones, boat)
    const keys = groups.map((g) => g.key)
    expect(keys).toContain('good')
    expect(keys).not.toContain('fair')
    const goodGroup = groups.find((g) => g.key === 'good')
    expect(goodGroup?.zones.some((z) => z.id === 'KL-712')).toBe(true)
  })

  it('includes all present catch tiers for fresh data', () => {
    const groups = groupZonesForTabs(calmForecast.zones, boat)
    expect(groups.map((g) => g.key)).toContain('good')
  })
})

import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import type { Forecast, Zone } from '@/domain/types'
import { zoneWhyPoints } from './zoneWhyPoints'

const forecast = calm as Forecast
const zone = forecast.zones[0] as Zone

describe('zoneWhyPoints', () => {
  it('returns three fish-focused points from confidence reasons', () => {
    const points = zoneWhyPoints(
      zone,
      (r) => `reason:${r}`,
      (k) => `today:${k}`,
    )
    expect(points).toHaveLength(3)
    expect(points[0]).toBe('reason:high_chlorophyll')
    expect(points.every((p) => !p.includes('wind'))).toBe(true)
  })

  it('pads with fallbacks when fewer than three reasons', () => {
    const sparse: Zone = {
      ...zone,
      confidence: { level: 'low', score: 0.3, reasons: ['weak_signal'] },
    }
    const points = zoneWhyPoints(
      sparse,
      (r) => `reason:${r}`,
      (k) => `today:${k}`,
    )
    expect(points).toHaveLength(3)
    expect(points[2]).toBe('today:whyPoint3')
  })
})

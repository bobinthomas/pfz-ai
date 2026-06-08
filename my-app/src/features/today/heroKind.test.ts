import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import { bestReachable } from '@/domain'
import type { Forecast } from '@/domain/types'
import { resolveHeroKind } from './heroKind'

const forecast = calm as Forecast

describe('resolveHeroKind', () => {
  it('returns normal for calm fixture', () => {
    const best = bestReachable(forecast.zones, forecast.boat!)
    expect(resolveHeroKind(forecast, best)).toBe('normal')
  })

  it('returns noBoat when boat missing', () => {
    const noBoat = { ...forecast, boat: undefined }
    expect(resolveHeroKind(noBoat, null)).toBe('noBoat')
  })

  it('returns empty when no zones', () => {
    const empty = { ...forecast, zones: [] }
    expect(resolveHeroKind(empty, null)).toBe('empty')
  })
})

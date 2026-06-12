import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import type { Forecast, Zone } from './types'
import {
  applyPresenceToZone,
  bucketFromCount,
  computeCatchShare,
  withDefaultPresence,
} from './presence'

const forecast = calm as Forecast
const munambam = forecast.zones.find((z) => z.id === 'KL-712') as Zone

describe('presence', () => {
  it('maps boat count to buckets', () => {
    expect(bucketFromCount(1)).toBe('quiet')
    expect(bucketFromCount(4)).toBe('some')
    expect(bucketFromCount(8)).toBe('busy')
    expect(bucketFromCount(15)).toBe('very_busy')
  })

  it('quiet zone with good catch → good share', () => {
    const z = applyPresenceToZone(munambam, 2, new Date().toISOString())
    expect(z.catchShare?.level).toBe('good')
    expect(z.catchShare?.reasonKey).toBe('shareGood')
  })

  it('very busy zone with good catch → low share', () => {
    const z = applyPresenceToZone(munambam, 14, new Date().toISOString())
    expect(z.catchShare?.level).toBe('low')
    expect(z.catchShare?.reasonKey).toBe('shareLow')
  })

  it('withDefaultPresence adds presence to ok zones', () => {
    const zones = withDefaultPresence(forecast.zones)
    const best = zones.find((z) => z.id === 'KL-712')
    expect(best?.presence?.boatCount).toBe(2)
    expect(computeCatchShare(best!).level).toBe('good')
  })
})

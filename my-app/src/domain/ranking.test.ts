import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import severe from '@/mocks/fixtures/forecast.severe.json'
import {
  bestReachable,
  confidenceDots,
  isReachable,
  strongerOutOfRange,
} from './ranking'
import { isSafetyBlocked } from './safety'
import type { Forecast } from './types'

const forecast = calm as Forecast
const boat = forecast.boat!

describe('ranking', () => {
  it('bestReachable picks KL-712 not KL-842 out of range', () => {
    const best = bestReachable(forecast.zones, boat)
    expect(best?.id).toBe('KL-712')
    expect(best?.name).toBe('Munambam Bank')
  })

  it('strongerOutOfRange is true for calm fixture', () => {
    expect(strongerOutOfRange(forecast.zones, boat)).toBe(true)
  })

  it('isReachable respects boat range', () => {
    const deep = forecast.zones.find((z) => z.id === 'KL-842')!
    expect(isReachable(deep, boat)).toBe(false)
    const near = forecast.zones.find((z) => z.id === 'KL-712')!
    expect(isReachable(near, boat)).toBe(true)
  })

  it('confidenceDots maps levels', () => {
    expect(confidenceDots('high')).toBe(3)
    expect(confidenceDots('fair')).toBe(2)
    expect(confidenceDots('low')).toBe(1)
  })
})

describe('safety', () => {
  it('isSafetyBlocked for severe fixture', () => {
    const f = severe as Forecast
    expect(isSafetyBlocked(f.weather)).toBe(true)
  })

  it('isSafetyBlocked false for calm', () => {
    expect(isSafetyBlocked(forecast.weather)).toBe(false)
  })
})

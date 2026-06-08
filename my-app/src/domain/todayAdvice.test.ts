import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Boat, Forecast } from './types'
import { bestReachable } from './ranking'
import { getStalenessFromMeta } from './staleness'
import { getTodayAdvice } from './todayAdvice'
const calmForecast = calm as Forecast
const staleForecast = stale as Forecast
const boat = calmForecast.boat as Boat
const now = new Date('2026-06-07T03:12:00Z')

function adviceFor(forecast: Forecast, at: Date) {
  const best = bestReachable(forecast.zones, boat)
  const staleness = getStalenessFromMeta(forecast.meta, at)
  return getTodayAdvice({
    heroKind: 'normal',
    bestZone: best,
    weather: forecast.weather,
    staleness,
  })
}

describe('getTodayAdvice', () => {
  it('fresh good fixture: confident headline and raw high confidence', () => {
    const freshNow = new Date('2026-06-07T06:00:00Z')
    const advice = adviceFor(calmForecast, freshNow)
    expect(advice.headlineKey).toBe('ch_good')
    expect(advice.displayConfidence).toBe('high')
    expect(advice.showStaleBanner).toBe(false)
    expect(advice.mutedCatchPill).toBe(false)
  })

  it('stale fixture: check-first headline and fair-capped confidence', () => {
    const advice = adviceFor(calmForecast, new Date('2026-06-07T14:00:00Z'))
    expect(advice.headlineKey).toBe('v_check_stale')
    expect(advice.displayConfidence).toBe('fair')
    expect(advice.showStaleBanner).toBe(true)
    expect(advice.mutedCatchPill).toBe(true)
    expect(advice.headlineKey).not.toBe('ch_good')
  })

  it('very_stale ~29h fixture: cautious headline and low confidence', () => {
    const advice = adviceFor(staleForecast, now)
    expect(advice.headlineKey).toBe('v_check')
    expect(advice.displayConfidence).toBe('low')
    expect(advice.showStaleBanner).toBe(true)
    expect(advice.mutedCatchPill).toBe(true)
    expect(advice.headlineKey).not.toBe('ch_good')
    expect(advice.headlineKey).not.toBe('v_go')
  })

  it('headline and confidence never disagree on very_stale', () => {
    const advice = adviceFor(staleForecast, now)
    const optimisticHeadlines = ['ch_good', 'v_go', 'ch_ok']
    expect(optimisticHeadlines).not.toContain(advice.headlineKey)
    expect(advice.displayConfidence).toBe('low')
  })

  it('severe override unchanged', () => {
    const severe = {
      ...calmForecast,
      weather: { ...calmForecast.weather, state: 'severe' as const, severeWarning: true },
    }
    const best = bestReachable(severe.zones, boat)
    const advice = getTodayAdvice({
      heroKind: 'severe',
      bestZone: best,
      weather: severe.weather,
      staleness: 'fresh',
    })
    expect(advice.headlineKey).toBe('v_stop')
    expect(advice.showStaleBanner).toBe(false)
  })
})

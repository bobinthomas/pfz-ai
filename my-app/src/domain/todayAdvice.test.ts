import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import severe from '@/mocks/fixtures/forecast.severe.json'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Forecast } from './types'
import { getTodayAdvice } from './todayAdvice'

const calmForecast = calm as Forecast
const staleForecast = stale as Forecast
const severeForecast = severe as Forecast

describe('getTodayAdvice', () => {
  it('AC1: fresh good safe → GO, high confidence, worth_it', () => {
    const advice = getTodayAdvice(calmForecast, new Date('2026-06-07T06:00:00Z'))
    expect(advice.decision).toBe('GO')
    expect(advice.confidence).toBe('high')
    expect(advice.worth?.verdict).toBe('worth_it')
    expect(advice.primaryAction).toBe('navigate')
    expect(advice.mutedCatchPill).toBe(false)
    expect(advice.bestZone?.id).toBe('KL-712')
  })

  it('AC2: stale ~30h → CAUTION never GO, low confidence, refresh primary', () => {
    const advice = getTodayAdvice(staleForecast, new Date('2026-06-07T03:12:00Z'), {
      online: true,
    })
    expect(advice.decision).toBe('CAUTION')
    expect(advice.decision).not.toBe('GO')
    expect(advice.confidence).toBe('low')
    expect(advice.staleness).toBe('very_stale')
    expect(advice.primaryAction).toBe('refresh')
    expect(advice.mutedCatchPill).toBe(true)
  })

  it('AC3: severe → NO_GO, severe screen state', () => {
    const advice = getTodayAdvice(severeForecast, new Date('2026-06-07T06:00:00Z'))
    expect(advice.decision).toBe('NO_GO')
    expect(advice.screenState).toBe('severe')
    expect(advice.decisionReasonKey).toBe('decisionReason_unsafe')
  })

  it('AC4: stronger zone out of range flag', () => {
    const advice = getTodayAdvice(calmForecast, new Date('2026-06-07T06:00:00Z'))
    expect(advice.bestZone?.id).toBe('KL-712')
    expect(advice.strongerOutOfRange).toBe(true)
  })

  it('stale caps confidence at fair when under 24h', () => {
    const advice = getTodayAdvice(calmForecast, new Date('2026-06-07T14:00:00Z'))
    expect(advice.staleness).toBe('stale')
    expect(advice.confidence).toBe('fair')
    expect(advice.decision).toBe('CAUTION')
  })

  it('no reachable catch above low → NO_GO', () => {
    const lowOnly = {
      ...calmForecast,
      zones: calmForecast.zones.filter((z) => z.id === 'KL-455'),
    }
    const advice = getTodayAdvice(lowOnly, new Date('2026-06-07T06:00:00Z'))
    expect(advice.decision).toBe('NO_GO')
    expect(advice.decisionReasonKey).toBe('decisionReason_no_reachable')
  })

  it('worth includes fuel estimate without profit', () => {
    const advice = getTodayAdvice(calmForecast, new Date('2026-06-07T06:00:00Z'))
    expect(advice.worth?.fuelLitres).toBe(24)
    expect(advice.worth?.fuelCost).toBe(2280)
    expect(advice.worth?.currency).toBe('INR')
  })

  it('offline stale: navigate primary, refresh disabled', () => {
    const advice = getTodayAdvice(staleForecast, new Date('2026-06-07T03:12:00Z'), {
      online: false,
    })
    expect(advice.primaryAction).toBe('navigate')
    expect(advice.canRefresh).toBe(false)
  })
})

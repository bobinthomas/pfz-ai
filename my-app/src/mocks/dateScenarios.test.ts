import { describe, expect, it } from 'vitest'
import { getTodayAdvice } from '@/domain/todayAdvice'
import type { Boat } from '@/domain/types'
import { buildDateOptions } from '@/lib/format/dateOptions'
import {
  buildDateScenarioForecast,
  demoScenarioForDate,
} from './dateScenarios'
import { buildMockForecast } from './fixtureData'

const now = new Date()
const options = buildDateOptions(now)

describe('demoScenarioForDate', () => {
  it('maps picker offsets to distinct scenarios', () => {
    expect(demoScenarioForDate(options[0], now)).toBe('caution_stale')
    expect(demoScenarioForDate(options[1], now)).toBe('go')
    expect(demoScenarioForDate(options[2], now)).toBe('caution_rough')
    expect(demoScenarioForDate(options[3], now)).toBe('no_go_severe')
    expect(demoScenarioForDate(options[4], now)).toBe('caution_marginal')
  })
})

describe('buildMockForecast date demos', () => {
  const boat = calmBoat()

  it('today → GO', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[1],
      boatId: boat.id,
      fixture: 'calm',
    })
    const advice = getTodayAdvice(forecast, now, { online: true })
    expect(advice.decision).toBe('GO')
  })

  it('yesterday → CAUTION (stale)', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[0],
      boatId: boat.id,
      fixture: 'calm',
    })
    const advice = getTodayAdvice(forecast, now, { online: true })
    expect(advice.decision).toBe('CAUTION')
    expect(advice.staleness).not.toBe('fresh')
  })

  it('tomorrow → busy best zone with fair share', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[2],
      boatId: boat.id,
      fixture: 'calm',
    })
    const best = forecast.zones.find((z) => z.id === 'KL-712')
    expect(best?.presence?.boatCount).toBe(9)
    expect(best?.catchShare?.level).toBe('fair')
  })

  it('tomorrow → CAUTION (rough)', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[2],
      boatId: boat.id,
      fixture: 'calm',
    })
    expect(forecast.weather.state).toBe('rough')
    const advice = getTodayAdvice(forecast, now, { online: true })
    expect(advice.decision).toBe('CAUTION')
  })

  it('+2 days → NO_GO (severe)', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[3],
      boatId: boat.id,
      fixture: 'calm',
    })
    const advice = getTodayAdvice(forecast, now, { online: true })
    expect(advice.decision).toBe('NO_GO')
  })

  it('dev preview fixture overrides date scenario', () => {
    const forecast = buildMockForecast({
      coastId: 'kochi',
      date: options[0],
      boatId: boat.id,
      fixture: 'stale',
    })
    expect(forecast.meta.generatedAt).toContain('2026-06-05')
  })
})

function calmBoat(): Boat {
  return buildDateScenarioForecast('go', now).boat as Boat
}

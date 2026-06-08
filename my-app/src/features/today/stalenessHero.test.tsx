import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Boat, Coast, Forecast, Weather } from '@/domain/types'
import '@/lib/i18n/config'
import { getStalenessFromMeta, getTodayAdvice } from '@/domain'
import { bestReachable } from '@/domain'
import { Hero } from './Hero'
import { resolveHeroKind } from './heroKind'

const staleForecast = stale as Forecast
const calmForecast = calm as Forecast
const boat = staleForecast.boat as Boat
const weather = staleForecast.weather as Weather
const coast = staleForecast.coast as Coast
const now = new Date('2026-06-07T03:12:00Z')

describe('Hero staleness display', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('very_stale: cautious headline, single Low confidence, muted pill, no double ago', () => {
    const best = bestReachable(staleForecast.zones, boat)
    const staleness = getStalenessFromMeta(staleForecast.meta, now)
    const advice = getTodayAdvice({
      heroKind: resolveHeroKind(staleForecast, best),
      bestZone: best,
      weather,
      staleness,
    })

    render(
      <Hero
        heroKind={resolveHeroKind(staleForecast, best)}
        bestZone={best}
        allZones={staleForecast.zones}
        coast={coast}
        boat={boat}
        weather={weather}
        dataStaleness={staleness}
        generatedAt={staleForecast.meta.generatedAt}
      />,
    )

    expect(advice.headlineKey).toBe('v_check')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Check before you go',
    )
    expect(screen.queryByText('Good day to fish')).toBeNull()
    expect(screen.getAllByText('Low')).toHaveLength(1)
    expect(screen.queryByText('High')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(
      'This advice is from about 29 hours ago — conditions may have changed.',
    )
    expect(screen.getByRole('status').textContent).not.toMatch(/ago ago/)
  })

  it('fresh good: confident headline and High confidence once', () => {
    vi.setSystemTime(new Date('2026-06-07T06:00:00Z'))
    const best = bestReachable(calmForecast.zones, boat)
    const staleness = getStalenessFromMeta(
      calmForecast.meta,
      new Date('2026-06-07T06:00:00Z'),
    )

    render(
      <Hero
        heroKind={resolveHeroKind(calmForecast, best)}
        bestZone={best}
        allZones={calmForecast.zones}
        coast={calmForecast.coast as Coast}
        boat={boat}
        weather={calmForecast.weather as Weather}
        dataStaleness={staleness}
        generatedAt={calmForecast.meta.generatedAt}
      />,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Good day to fish',
    )
    expect(screen.getAllByText('High')).toHaveLength(1)
    expect(screen.queryByRole('status')).toBeNull()
  })
})

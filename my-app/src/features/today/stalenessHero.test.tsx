import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Forecast } from '@/domain/types'
import '@/lib/i18n/config'
import { bestReachable, getTodayAdvice } from '@/domain'
import { Hero } from './Hero'

const staleForecast = stale as Forecast
const calmForecast = calm as Forecast
const now = new Date('2026-06-07T03:12:00Z')

describe('Hero decision display', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('very_stale: CAUTION badge, Low confidence once, muted pill, no double ago', () => {
    const advice = getTodayAdvice(staleForecast, now, { online: true })
    const best = bestReachable(staleForecast.zones, staleForecast.boat!)

    render(
      <Hero
        advice={advice}
        forecast={staleForecast}
        bestZone={best}
        isFetching={false}
        onRefresh={() => {}}
      />,
    )

    expect(advice.decision).toBe('CAUTION')
    expect(advice.catchHeadlineKey).toBe('ch_good')
    expect(screen.getByText('Strong catch likely')).toBeInTheDocument()
    expect(screen.getByText('GO WITH CAUTION')).toBeInTheDocument()
    expect(screen.getAllByText('Low')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'This advice is from about 29 hours ago — conditions may have changed.',
    )
    expect(screen.getByRole('status').textContent).not.toMatch(/ago ago/)
    expect(screen.getByText("Get today's reading")).toBeInTheDocument()
  })

  it('fresh good: GO badge and High confidence once', () => {
    vi.setSystemTime(new Date('2026-06-07T06:00:00Z'))
    const advice = getTodayAdvice(calmForecast, new Date('2026-06-07T06:00:00Z'))
    const best = bestReachable(calmForecast.zones, calmForecast.boat!)

    render(
      <Hero
        advice={advice}
        forecast={calmForecast}
        bestZone={best}
        isFetching={false}
        onRefresh={() => {}}
      />,
    )

    expect(advice.decision).toBe('GO')
    expect(screen.getByText('Strong catch likely')).toBeInTheDocument()
    expect(screen.getByText('GO')).toBeInTheDocument()
    expect(screen.getAllByText('High')).toHaveLength(1)
    expect(screen.getByText(/Best at Munambam Bank/)).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })
})

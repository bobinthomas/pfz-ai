import { beforeEach, describe, expect, it } from 'vitest'
import { resolveInitialForecastDate } from './forecastSelectionStore'

describe('resolveInitialForecastDate', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('defaults to calendar today on first visit', () => {
    const now = new Date(2026, 5, 8, 10, 0, 0)
    expect(resolveInitialForecastDate(now)).toBe('2026-06-08')
  })

  it('resets to today when calendar day changes', () => {
    const june7 = new Date(2026, 5, 7, 10, 0, 0)
    resolveInitialForecastDate(june7)
    sessionStorage.setItem('pfz-forecast-date', '2026-06-07')
    sessionStorage.setItem('pfz-forecast-date-user-picked', '1')

    const june8 = new Date(2026, 5, 8, 9, 0, 0)
    expect(resolveInitialForecastDate(june8)).toBe('2026-06-08')
  })

  it('keeps user-picked date within the same calendar day', () => {
    const now = new Date(2026, 5, 8, 10, 0, 0)
    resolveInitialForecastDate(now)
    sessionStorage.setItem('pfz-forecast-date', '2026-06-09')
    sessionStorage.setItem('pfz-forecast-date-user-picked', '1')

    expect(resolveInitialForecastDate(now)).toBe('2026-06-09')
  })
})

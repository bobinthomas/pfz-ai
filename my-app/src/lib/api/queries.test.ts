import { describe, expect, it } from 'vitest'
import { forecastQueryKey, FORECAST_MOCK_CACHE_VERSION } from './queries'

describe('forecastQueryKey', () => {
  const params = {
    coastId: 'kochi',
    date: '2026-06-08',
    boatId: 'KER-992-04',
    fixture: 'calm',
  }

  it('includes fixture and mock cache version in dev/demo', () => {
    const key = forecastQueryKey(params)
    expect(key).toContain(params.fixture)
    expect(key).toContain(FORECAST_MOCK_CACHE_VERSION)
  })

  it('differs per date so each day loads its own scenario', () => {
    const a = forecastQueryKey({ ...params, date: '2026-06-07' })
    const b = forecastQueryKey({ ...params, date: '2026-06-08' })
    expect(a).not.toEqual(b)
  })
})

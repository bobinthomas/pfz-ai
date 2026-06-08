import { useQuery } from '@tanstack/react-query'
import { useMockApi } from '@/mocks/fixtureData'
import { fetchForecast } from './client'
import type { ForecastParams } from './client'

/** Bump when bundled mock shape/logic changes (invalidates persisted IDB cache). */
export const FORECAST_MOCK_CACHE_VERSION = 'date-scenarios-v1'

export function forecastQueryKey(params: ForecastParams) {
  const base = [
    'forecast',
    params.coastId,
    params.date,
    params.boatId,
    params.fixture ?? 'calm',
  ] as const

  if (useMockApi() || import.meta.env.DEV) {
    return [...base, FORECAST_MOCK_CACHE_VERSION] as const
  }

  return base
}

export function useForecast(params: ForecastParams) {
  const demoMocks = useMockApi() || import.meta.env.DEV

  return useQuery({
    queryKey: forecastQueryKey(params),
    queryFn: () => fetchForecast(params),
    staleTime: demoMocks ? 0 : 6 * 60 * 60 * 1000,
  })
}

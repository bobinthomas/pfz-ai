import { useQuery } from '@tanstack/react-query'
import { fetchForecast } from './client'
import type { ForecastParams } from './client'

export function forecastQueryKey(params: ForecastParams) {
  return ['forecast', params.coastId, params.date, params.boatId] as const
}

export function useForecast(params: ForecastParams) {
  return useQuery({
    queryKey: forecastQueryKey(params),
    queryFn: () => fetchForecast(params),
    staleTime: 6 * 60 * 60 * 1000,
  })
}

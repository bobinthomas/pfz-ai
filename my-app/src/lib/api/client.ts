import { forecastSchema } from './schema'
import { parseProblemDetail } from './errors'
import type { Forecast } from '@/domain/types'

export interface ForecastParams {
  coastId: string
  date: string
  boatId: string
  fixture?: string
}

export async function fetchForecast(params: ForecastParams): Promise<Forecast> {
  const search = new URLSearchParams({
    coast: params.coastId,
    date: params.date,
    boatId: params.boatId,
  })
  if (params.fixture) search.set('fixture', params.fixture)

  const response = await fetch(`/v1/forecast?${search}`)

  if (!response.ok) {
    const problem = await parseProblemDetail(response)
    throw problem
  }

  const json: unknown = await response.json()
  return forecastSchema.parse(json) as Forecast
}

import { boatById } from '@/lib/boat/boats'
import { coastById } from '@/lib/coast/coasts'
import type { Forecast, ProblemDetail } from '@/domain/types'
import calm from './fixtures/forecast.calm.json'
import severe from './fixtures/forecast.severe.json'
import stale from './fixtures/forecast.stale.json'
import tripsFixture from './fixtures/trips.json'
import type { TripsResponse } from '@/lib/api/trips'

const FIXTURES: Record<string, unknown> = {
  calm,
  severe,
  rough: {
    ...calm,
    weather: { ...calm.weather, state: 'rough', severeWarning: false },
  },
  empty: { ...calm, zones: [] },
  outofrange: {
    ...calm,
    zones: calm.zones
      .filter((z) => z.dataStatus === 'ok')
      .map((z) => ({ ...z, distanceKm: z.distanceKm + 60 })),
  },
  stale,
  noboat: (() => {
    const copy = { ...calm }
    delete (copy as { boat?: unknown }).boat
    return copy
  })(),
}

export interface ForecastQueryParams {
  coastId: string
  date: string
  boatId: string
  fixture?: string
}

export function forecastUnavailableProblem(): ProblemDetail {
  return {
    type: 'about:blank',
    title: 'Forecast unavailable',
    detail: 'The forecast service is temporarily unavailable.',
    status: 503,
    traceparent: '00-abc123-def456-01',
  }
}

export function buildMockForecast(params: ForecastQueryParams): Forecast {
  if (params.fixture === 'error') {
    throw forecastUnavailableProblem()
  }

  const fixture = params.fixture ?? 'calm'
  const base = (FIXTURES[fixture] ?? calm) as Record<string, unknown>
  const coast = coastById(params.coastId)
  const harbour =
    (base.coast as { harbour?: unknown })?.harbour ?? calm.coast.harbour
  const selectedBoat = boatById(params.boatId) ?? calm.boat

  return {
    ...base,
    date: params.date,
    coast: { id: coast.id, name: coast.name, harbour },
    ...(fixture === 'noboat' ? {} : { boat: selectedBoat }),
  } as Forecast
}

export function buildMockTrips(): TripsResponse {
  return tripsFixture as TripsResponse
}

export function useMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCKS === 'true'
}

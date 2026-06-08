import { http, HttpResponse } from 'msw'
import { boatById } from '@/lib/boat/boats'
import { coastById } from '@/lib/coast/coasts'
import calm from './fixtures/forecast.calm.json'
import severe from './fixtures/forecast.severe.json'
import stale from './fixtures/forecast.stale.json'
import tripsFixture from './fixtures/trips.json'

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

function getFixture(request: Request) {
  const url = new URL(request.url)
  const fixture = url.searchParams.get('fixture') ?? 'calm'
  const base = (FIXTURES[fixture] ?? calm) as Record<string, unknown>
  const date = url.searchParams.get('date')
  const coastId = url.searchParams.get('coast') ?? 'kochi'
  const boatId = url.searchParams.get('boatId') ?? 'KER-992-04'
  const coast = coastById(coastId)
  const harbour = (base.coast as { harbour?: unknown })?.harbour ?? calm.coast.harbour
  const selectedBoat = boatById(boatId) ?? calm.boat

  return {
    ...base,
    ...(date ? { date } : {}),
    coast: { id: coast.id, name: coast.name, harbour },
    ...(fixture === 'noboat' ? {} : { boat: selectedBoat }),
  }
}

export const handlers = [
  http.get('/v1/forecast', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('fixture') === 'error') {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Forecast unavailable',
          detail: 'The forecast service is temporarily unavailable.',
          status: 503,
          traceparent: '00-abc123-def456-01',
        },
        { status: 503, headers: { 'Content-Type': 'application/problem+json' } },
      )
    }
    return HttpResponse.json(getFixture(request))
  }),
  http.get('/v1/trips', () => HttpResponse.json(tripsFixture)),
]

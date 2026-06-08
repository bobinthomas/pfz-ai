import { http, HttpResponse } from 'msw'
import {
  buildMockForecast,
  buildMockTrips,
  forecastUnavailableProblem,
} from './fixtureData'

export const handlers = [
  http.get('/v1/forecast', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('fixture') === 'error') {
      return HttpResponse.json(forecastUnavailableProblem(), {
        status: 503,
        headers: { 'Content-Type': 'application/problem+json' },
      })
    }
    return HttpResponse.json(
      buildMockForecast({
        coastId: url.searchParams.get('coast') ?? 'kochi',
        date: url.searchParams.get('date') ?? '',
        boatId: url.searchParams.get('boatId') ?? 'KER-992-04',
        fixture: url.searchParams.get('fixture') ?? undefined,
      }),
    )
  }),
  http.get('/v1/trips', () => HttpResponse.json(buildMockTrips())),
]

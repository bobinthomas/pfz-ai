import { bestReachable, strongerOutOfRange, type Forecast } from '@/domain'

const OUT_OF_SCOPE =
  /score|cricket|movie|joke|news|politic|football|weather in delhi/i

export function classifyReply(text: string): string {
  if (OUT_OF_SCOPE.test(text)) {
    return 'redirect'
  }
  return 'in_scope'
}

export function buildReply(
  text: string,
  forecast: Forecast,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (classifyReply(text) === 'redirect') {
    return t('assistant:redirect')
  }

  if (!forecast.boat) return t('assistant:noBoat')

  const best = bestReachable(forecast.zones, forecast.boat)
  const outOfRange = /out of|range|too far/i.test(text)

  if (outOfRange && strongerOutOfRange(forecast.zones, forecast.boat)) {
    return t('assistant:outOfRange')
  }

  if (/tuna/i.test(text) && best) {
    const hasTuna = best.species?.includes('tuna')
    return hasTuna
      ? t('assistant:tunaYes', { zone: best.name, km: best.distanceKm })
      : t('assistant:tunaNo')
  }

  if (/last week|history|track/i.test(text)) {
    return t('assistant:lastWeek', {
      correct: forecast.accuracy.correct,
      days: forecast.accuracy.windowDays,
    })
  }

  if (best) {
    return t('assistant:bestToday', {
      zone: best.name,
      km: best.distanceKm,
      bearing: best.bearing,
      eta: Math.round(best.etaMins / 60),
      mins: best.etaMins % 60,
      state: forecast.weather.state,
    })
  }

  return t('assistant:noSpots')
}

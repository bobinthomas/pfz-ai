import { isSafetyBlocked, type Boat, type Forecast, type Zone } from '@/domain'

export type HeroKind = 'normal' | 'severe' | 'noReachable' | 'empty' | 'noBoat'

export function resolveHeroKind(
  forecast: Forecast,
  best: Zone | null,
): HeroKind {
  if (!forecast.boat) return 'noBoat'
  if (isSafetyBlocked(forecast.weather)) return 'severe'
  if (forecast.zones.length === 0) return 'empty'
  if (!best) return 'noReachable'
  return 'normal'
}

export function requireBoat(boat: Boat | undefined): Boat {
  if (!boat) {
    throw new Error('Boat required')
  }
  return boat
}

import type { Weather } from './types'

export function isSafetyBlocked(weather: Weather): boolean {
  return weather.severeWarning === true || weather.state === 'severe'
}

import type { Weather } from '@/domain/types'
import { isSafetyBlocked } from '@/domain/safety'

export type HeroVariant = 'go' | 'caution' | 'stop'

export function heroVariant(weather: Weather): HeroVariant {
  if (isSafetyBlocked(weather)) return 'stop'
  if (weather.state === 'rough') return 'caution'
  return 'go'
}

export const HERO_GRADIENTS: Record<HeroVariant, string> = {
  go: 'var(--hero-go)',
  caution: 'var(--hero-caution)',
  stop: 'var(--hero-stop)',
}

import type { Boat, ForecastConfig, Zone } from './types'

export type WorthVerdict = 'worth_it' | 'marginal' | 'not_worth'

export interface WorthInfo {
  verdict: WorthVerdict
  fuelLitres: number
  fuelCost: number
  currency: string
}

export interface FuelEstimate {
  fuelLitres: number
  fuelCost: number
  currency: string
  roundTripKm: number
}

const DEFAULT_FUEL_PER_KM = 0.4
const DEFAULT_FUEL_PRICE = 95
const DEFAULT_CURRENCY = 'INR'

export function resolveConfig(config?: ForecastConfig): Required<ForecastConfig> {
  return {
    fuelPricePerLitre: config?.fuelPricePerLitre ?? DEFAULT_FUEL_PRICE,
    currency: config?.currency ?? DEFAULT_CURRENCY,
  }
}

export function fuelLitresPerKm(boat: Boat): number {
  return boat.fuelLitresPerKm ?? DEFAULT_FUEL_PER_KM
}

export function computeFuelRoundTrip(
  distanceKm: number,
  boat: Boat,
  config?: ForecastConfig,
): FuelEstimate {
  const cfg = resolveConfig(config)
  const litres = Math.round(2 * distanceKm * fuelLitresPerKm(boat))
  return {
    fuelLitres: litres,
    fuelCost: Math.round(litres * cfg.fuelPricePerLitre),
    currency: cfg.currency,
    roundTripKm: Math.round(distanceKm * 2),
  }
}

export function zoneFuelEstimate(
  zone: Zone,
  boat: Boat,
  config?: ForecastConfig,
): FuelEstimate {
  return computeFuelRoundTrip(zone.distanceKm, boat, config)
}

export function computeWorth(
  zone: Zone,
  boat: Boat,
  cappedConfidenceScore: number,
  config?: ForecastConfig,
): WorthInfo {
  const fuel = computeFuelRoundTrip(zone.distanceKm, boat, config)
  const catchScore = zone.catch?.score ?? 0
  const reward = catchScore * cappedConfidenceScore
  const effortNorm = zone.distanceKm / Math.max(boat.rangeKm, 1)

  let verdict: WorthVerdict = 'marginal'
  if (reward >= 0.55 && effortNorm <= 0.65) verdict = 'worth_it'
  else if (reward < 0.35 || effortNorm > 0.8) verdict = 'not_worth'

  return {
    verdict,
    fuelLitres: fuel.fuelLitres,
    fuelCost: fuel.fuelCost,
    currency: fuel.currency,
  }
}

import type { Boat } from '@/domain/types'

export const BOAT_CATALOG: Boat[] = [
  {
    id: 'KER-992-04',
    name: 'Sea Queen II',
    rangeKm: 50,
    gear: ['purse_seine'],
    maxDepthM: 80,
    fuelLitresPerKm: 0.4,
  },
  {
    id: 'KER-445-12',
    name: 'Lakshmi Devi',
    rangeKm: 35,
    gear: ['gillnet'],
    maxDepthM: 50,
    fuelLitresPerKm: 0.35,
  },
  {
    id: 'KER-118-07',
    name: 'Ocean Star',
    rangeKm: 70,
    gear: ['longline', 'purse_seine'],
    maxDepthM: 100,
    fuelLitresPerKm: 0.45,
  },
]

export function boatById(id: string): Boat | undefined {
  return BOAT_CATALOG.find((b) => b.id === id)
}

export const DEFAULT_BOAT_ID = BOAT_CATALOG[0].id

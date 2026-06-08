import { sortZones, type Boat, type Zone } from '@/domain'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function buildZoneLetterMap(zones: Zone[], boat: Boat): Map<string, string> {
  const sorted = sortZones(zones, boat)
  const map = new Map<string, string>()
  sorted.forEach((z, i) => {
    map.set(z.id, LETTERS[i] ?? z.id.slice(-1))
  })
  return map
}

export function zoneLetter(
  zoneId: string,
  zones: Zone[],
  boat: Boat,
): string {
  return buildZoneLetterMap(zones, boat).get(zoneId) ?? '?'
}

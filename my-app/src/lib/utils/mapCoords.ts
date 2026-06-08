import { bearingToDegrees } from './bearing'

export const MAP_HARBOUR = { x: 280, y: 300 }
export const MAP_SCALE = 2.4
export const MAP_MAX_R = 250

/** Plot zone bearing/distance from harbour; sea lies above the shore line. */
export function zoneToMapXY(distanceKm: number, bearing: string) {
  const d = Math.min(distanceKm * MAP_SCALE, MAP_MAX_R)
  const screenDeg = 450 - bearingToDegrees(bearing)
  const rad = (screenDeg * Math.PI) / 180
  return {
    x: MAP_HARBOUR.x + d * Math.cos(rad),
    y: MAP_HARBOUR.y + d * Math.sin(rad),
  }
}

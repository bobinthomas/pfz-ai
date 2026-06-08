import { describe, expect, it } from 'vitest'
import { MAP_HARBOUR, zoneToMapXY } from './mapCoords'

describe('zoneToMapXY', () => {
  it('plots SW zone up-left of harbour in the sea', () => {
    const p = zoneToMapXY(30, 'SW')
    expect(p.y).toBeLessThan(MAP_HARBOUR.y)
    expect(p.x).toBeLessThan(MAP_HARBOUR.x)
  })

  it('scales distance roughly with km', () => {
    const near = zoneToMapXY(12, 'SSW')
    const far = zoneToMapXY(78, 'W')
    const nearDist = Math.hypot(near.x - MAP_HARBOUR.x, near.y - MAP_HARBOUR.y)
    const farDist = Math.hypot(far.x - MAP_HARBOUR.x, far.y - MAP_HARBOUR.y)
    expect(farDist).toBeGreaterThan(nearDist)
  })
})

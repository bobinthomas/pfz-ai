import { beforeEach, describe, expect, it } from 'vitest'
import { BOAT_CATALOG } from './boats'
import { useBoatStore } from './boatStore'

describe('useBoatStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useBoatStore.setState({ boatId: BOAT_CATALOG[0].id })
  })

  it('persists boat selection', () => {
    const next = BOAT_CATALOG[1].id
    useBoatStore.getState().setBoatId(next)
    expect(useBoatStore.getState().boatId).toBe(next)
    expect(localStorage.getItem('pfz-boat-id')).toBe(next)
  })

  it('ignores unknown boat ids', () => {
    useBoatStore.getState().setBoatId('UNKNOWN')
    expect(useBoatStore.getState().boatId).toBe(BOAT_CATALOG[0].id)
  })
})

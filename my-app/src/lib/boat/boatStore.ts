import { create } from 'zustand'
import { DEFAULT_BOAT_ID, boatById } from './boats'

const STORAGE_KEY = 'pfz-boat-id'

function readStored(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_BOAT_ID
  const v = localStorage.getItem(STORAGE_KEY)
  return boatById(v ?? '') ? v! : DEFAULT_BOAT_ID
}

interface BoatState {
  boatId: string
  setBoatId: (id: string) => void
}

export const useBoatStore = create<BoatState>((set) => ({
  boatId: readStored(),
  setBoatId: (id) => {
    if (!boatById(id)) return
    localStorage.setItem(STORAGE_KEY, id)
    set({ boatId: id })
  },
}))

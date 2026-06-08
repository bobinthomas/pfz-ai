import { create } from 'zustand'

interface SafetyState {
  severeWarning: boolean
  setSevereWarning: (value: boolean) => void
}

export const useSafetyStore = create<SafetyState>((set) => ({
  severeWarning: false,
  setSevereWarning: (value) => set({ severeWarning: value }),
}))

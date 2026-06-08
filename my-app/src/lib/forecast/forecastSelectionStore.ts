import { create } from 'zustand'
import { todayIsoDate } from '@/lib/format/time'

interface ForecastSelectionState {
  coastId: string
  date: string
  setCoastId: (coastId: string) => void
  setDate: (date: string) => void
}

export const useForecastSelectionStore = create<ForecastSelectionState>((set) => ({
  coastId: 'kochi',
  date: todayIsoDate(),
  setCoastId: (coastId) => set({ coastId }),
  setDate: (date) => set({ date }),
}))

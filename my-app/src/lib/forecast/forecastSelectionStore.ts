import { create } from 'zustand'
import { buildDateOptions } from '@/lib/format/dateOptions'
import { todayIsoDate } from '@/lib/format/time'

const DATE_STORAGE = 'pfz-forecast-date'
const DATE_ANCHOR = 'pfz-forecast-date-anchor'
const USER_PICKED = 'pfz-forecast-date-user-picked'

interface ForecastSelectionState {
  coastId: string
  date: string
  setCoastId: (coastId: string) => void
  setDate: (date: string) => void
  /** Re-align to calendar today when the day rolls over (or on first visit). */
  syncDateToToday: () => void
}

export function resolveInitialForecastDate(now = new Date()): string {
  const today = todayIsoDate(now)
  if (typeof sessionStorage === 'undefined') return today

  const anchor = sessionStorage.getItem(DATE_ANCHOR)
  if (anchor !== today) {
    sessionStorage.setItem(DATE_ANCHOR, today)
    sessionStorage.removeItem(USER_PICKED)
    sessionStorage.setItem(DATE_STORAGE, today)
    return today
  }

  if (sessionStorage.getItem(USER_PICKED) === '1') {
    const stored = sessionStorage.getItem(DATE_STORAGE)
    if (stored && buildDateOptions(now).includes(stored)) return stored
  }

  return today
}

export const useForecastSelectionStore = create<ForecastSelectionState>((set) => ({
  coastId: 'kochi',
  date: resolveInitialForecastDate(),
  setCoastId: (coastId) => set({ coastId }),
  setDate: (date) => {
    const today = todayIsoDate()
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DATE_STORAGE, date)
      sessionStorage.setItem(USER_PICKED, date === today ? '0' : '1')
    }
    set({ date })
  },
  syncDateToToday: () => {
    const today = resolveInitialForecastDate()
    set({ date: today })
  },
}))

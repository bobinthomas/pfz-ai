import { create } from 'zustand'
import { flushOutbox } from './outbox'

interface ConnectivityState {
  online: boolean
  lastSyncedAt: Date | null
  setOnline: (online: boolean) => void
  setLastSyncedAt: (date: Date) => void
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncedAt: null,
  setOnline: (online) => set({ online }),
  setLastSyncedAt: (date) => set({ lastSyncedAt: date }),
}))

export function initConnectivityListener() {
  const { setOnline, setLastSyncedAt } = useConnectivityStore.getState()

  const handleOnline = () => {
    setOnline(true)
    void flushOutbox().then((n) => {
      if (n > 0) setLastSyncedAt(new Date())
    })
  }
  const handleOffline = () => setOnline(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export function hoursSinceSync(lastSyncedAt: Date | null): number | null {
  if (!lastSyncedAt) return null
  return Math.floor((Date.now() - lastSyncedAt.getTime()) / (1000 * 60 * 60))
}

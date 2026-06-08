import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useEffect, type ReactNode } from 'react'
import { initConnectivityListener } from '@/lib/offline/connectivity'
import { idbPersister } from '@/lib/offline/persistence'
import '@/lib/i18n/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 6 * 60 * 60 * 1000,
      networkMode: 'offlineFirst',
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => initConnectivityListener(), [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: idbPersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}

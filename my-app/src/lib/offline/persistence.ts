import { get, set, del } from 'idb-keyval'
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client'

const KEY = 'pfz-query-cache'

export const idbPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await set(KEY, client)
  },
  restoreClient: async () => {
    return await get<PersistedClient>(KEY)
  },
  removeClient: async () => {
    await del(KEY)
  },
}

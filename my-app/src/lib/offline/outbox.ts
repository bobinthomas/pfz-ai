import { get, set } from 'idb-keyval'

const OUTBOX_KEY = 'pfz-outbox'

export interface OutboxItem {
  id: string
  zoneId: string
  zoneName: string
  createdAt: string
}

async function readOutbox(): Promise<OutboxItem[]> {
  return (await get<OutboxItem[]>(OUTBOX_KEY)) ?? []
}

export async function enqueueSave(zoneId: string, zoneName: string): Promise<OutboxItem> {
  const item: OutboxItem = {
    id: crypto.randomUUID(),
    zoneId,
    zoneName,
    createdAt: new Date().toISOString(),
  }
  const items = await readOutbox()
  await set(OUTBOX_KEY, [...items, item])
  return item
}

export async function flushOutbox(): Promise<number> {
  const items = await readOutbox()
  if (items.length === 0) return 0
  // MVP: clear queue after simulated sync
  await set(OUTBOX_KEY, [])
  return items.length
}

export async function outboxCount(): Promise<number> {
  return (await readOutbox()).length
}

export async function listSavedSpots(): Promise<OutboxItem[]> {
  const items = await readOutbox()
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function removeSavedSpot(id: string): Promise<void> {
  const items = await readOutbox()
  await set(
    OUTBOX_KEY,
    items.filter((item) => item.id !== id),
  )
}

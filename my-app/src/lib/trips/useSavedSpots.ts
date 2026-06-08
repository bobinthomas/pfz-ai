import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listSavedSpots, removeSavedSpot } from '@/lib/offline/outbox'

export const SAVED_SPOTS_KEY = ['saved-spots'] as const

export function useSavedSpots() {
  return useQuery({
    queryKey: SAVED_SPOTS_KEY,
    queryFn: listSavedSpots,
    staleTime: 0,
  })
}

export function useRemoveSavedSpot() {
  const qc = useQueryClient()
  return async (id: string) => {
    await removeSavedSpot(id)
    await qc.invalidateQueries({ queryKey: SAVED_SPOTS_KEY })
  }
}

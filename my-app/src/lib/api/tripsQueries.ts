import { useQuery } from '@tanstack/react-query'
import { fetchTrips } from './trips'

export function tripsQueryKey(boatId: string) {
  return ['trips', boatId] as const
}

export function useTrips(boatId: string) {
  return useQuery({
    queryKey: tripsQueryKey(boatId),
    queryFn: () => fetchTrips(boatId),
    staleTime: 30 * 60 * 1000,
  })
}

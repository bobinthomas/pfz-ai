import type { CatchTier } from '@/domain/types'
import { buildMockTrips, useMockApi } from '@/mocks/fixtureData'

export type TripOutcome = 'good_catch' | 'some_catch' | 'poor_catch' | 'no_catch'

export interface TripRecord {
  id: string
  date: string
  zoneName: string
  coastName: string
  distanceKm: number
  catchTier: CatchTier
  outcome: TripOutcome
}

export interface TripsResponse {
  trips: TripRecord[]
}

export async function fetchTrips(boatId: string): Promise<TripsResponse> {
  if (useMockApi()) {
    return buildMockTrips()
  }

  const search = new URLSearchParams({ boatId })
  const response = await fetch(`/v1/trips?${search}`)
  if (!response.ok) throw new Error('Failed to load trips')
  return response.json() as Promise<TripsResponse>
}

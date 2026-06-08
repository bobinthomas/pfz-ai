import { create } from 'zustand'

export const FIXTURES = [
  'calm',
  'rough',
  'severe',
  'stale',
  'outofrange',
  'empty',
  'noboat',
  'error',
] as const

interface DevPreviewState {
  fixture: string
  setFixture: (fixture: string) => void
}

export const useDevPreviewStore = create<DevPreviewState>((set) => ({
  fixture: 'calm',
  setFixture: (fixture) => set({ fixture }),
}))

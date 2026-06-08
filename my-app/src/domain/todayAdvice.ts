import { catchHeadlineKey } from './ranking'
import { cappedConfidence } from './staleness'
import type { StalenessLevel } from './staleness'
import type { CatchTier, ConfidenceLevel, Weather, Zone } from './types'

export type AdviceHeroKind =
  | 'normal'
  | 'severe'
  | 'noReachable'
  | 'empty'
  | 'noBoat'

export interface TodayAdvice {
  headlineKey: string
  sublineKey: string
  displayConfidence: ConfidenceLevel | null
  showStaleBanner: boolean
  mutedCatchPill: boolean
  gradient: 'go' | 'caution' | 'stop' | 'neutral'
}

export interface TodayAdviceInput {
  heroKind: AdviceHeroKind
  bestZone: Zone | null
  weather: Weather
  staleness: StalenessLevel
}

function freshHeadlineKey(catchTier: CatchTier, weather: Weather): string {
  if (weather.state === 'rough') return 'v_caution'
  return catchHeadlineKey(catchTier)
}

function freshSublineKey(catchTier: CatchTier, weather: Weather): string {
  if (weather.state === 'rough') return 's_caution'
  const map: Record<CatchTier, string> = {
    good: 's_go',
    ok: 's_ch_ok',
    low: 's_ch_low',
    nodata: 's_ch_low',
  }
  return map[catchTier]
}

export function getTodayAdvice(input: TodayAdviceInput): TodayAdvice {
  const { heroKind, bestZone, weather, staleness } = input

  if (heroKind === 'severe') {
    return {
      headlineKey: 'v_stop',
      sublineKey: 's_stop',
      displayConfidence: null,
      showStaleBanner: false,
      mutedCatchPill: false,
      gradient: 'stop',
    }
  }

  if (heroKind === 'noBoat') {
    return {
      headlineKey: 'noBoatTitle',
      sublineKey: 'noBoatSub',
      displayConfidence: null,
      showStaleBanner: false,
      mutedCatchPill: false,
      gradient: 'neutral',
    }
  }

  if (heroKind === 'noReachable') {
    return {
      headlineKey: 'noReachableTitle',
      sublineKey: 'noReachableSub',
      displayConfidence: null,
      showStaleBanner: staleness !== 'fresh',
      mutedCatchPill: staleness !== 'fresh',
      gradient: 'neutral',
    }
  }

  if (heroKind === 'empty') {
    return {
      headlineKey: 'emptyTitle',
      sublineKey: 'emptySub',
      displayConfidence: null,
      showStaleBanner: staleness !== 'fresh',
      mutedCatchPill: staleness !== 'fresh',
      gradient: 'neutral',
    }
  }

  const catchTier = bestZone?.catch?.tier ?? 'nodata'
  const rawConfidence = bestZone?.confidence?.level ?? null
  const displayConfidence = rawConfidence
    ? cappedConfidence(rawConfidence, staleness)
    : null
  const showStaleBanner = staleness !== 'fresh'
  const mutedCatchPill = staleness !== 'fresh'

  if (staleness === 'very_stale') {
    return {
      headlineKey: 'v_check',
      sublineKey:
        weather.state === 'rough' ? 's_check_very_stale_rough' : 's_check_very_stale',
      displayConfidence,
      showStaleBanner,
      mutedCatchPill,
      gradient: weather.state === 'rough' ? 'caution' : 'go',
    }
  }

  if (staleness === 'stale') {
    return {
      headlineKey: 'v_check_stale',
      sublineKey:
        weather.state === 'rough' ? 's_caution_stale' : 's_go_stale',
      displayConfidence,
      showStaleBanner,
      mutedCatchPill,
      gradient: weather.state === 'rough' ? 'caution' : 'go',
    }
  }

  return {
    headlineKey: freshHeadlineKey(catchTier, weather),
    sublineKey: freshSublineKey(catchTier, weather),
    displayConfidence,
    showStaleBanner: false,
    mutedCatchPill: false,
    gradient: weather.state === 'rough' ? 'caution' : 'go',
  }
}

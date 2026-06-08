import { computeWorth, type WorthInfo } from './economics'
import {
  bestReachable,
  catchHeadlineKey,
  hasReachableCatchAboveLow,
  strongerOutOfRange,
} from './ranking'
import { relativeTimeParts, type RelativeTimeParts } from './relativeTime'
import { cappedConfidence, getStalenessFromMeta, type StalenessLevel } from './staleness'
import type {
  CatchTier,
  ConfidenceLevel,
  Decision,
  Forecast,
  PrimaryAction,
  Weather,
  WeatherVerdict,
  Zone,
} from './types'

export type AdviceScreenState =
  | 'normal'
  | 'severe'
  | 'noReachable'
  | 'empty'
  | 'noBoat'

export type HeroGradient = 'good' | 'ok' | 'low' | 'stop' | 'neutral'

export interface TodayAdviceView {
  screenState: AdviceScreenState
  decision: Decision | null
  decisionReasonKey: string
  /** v41 catch-first hero headline (ch_good, v_stop, emptyTitle, …). */
  catchHeadlineKey: string
  heroGradient: HeroGradient
  /** Narrative confidence reason for the hero block (reasonHigh, reasonFair, …). */
  catchConfidenceReasonKey: string
  bestZone: Zone | null
  catchTier: CatchTier | null
  confidence: ConfidenceLevel | null
  confidenceReasonKey: string
  staleness: StalenessLevel
  humanizedAge: RelativeTimeParts
  weatherVerdict: WeatherVerdict
  worth: WorthInfo | null
  strongerOutOfRange: boolean
  primaryAction: PrimaryAction
  canRefresh: boolean
  mutedCatchPill: boolean
}

export interface TodayAdviceOptions {
  online?: boolean
}

function weatherVerdict(weather: Weather): WeatherVerdict {
  if (weather.severeWarning || weather.state === 'severe') return 'unsafe'
  if (weather.state === 'rough') return 'caution'
  return 'safe'
}

function cappedConfidenceScore(level: ConfidenceLevel): number {
  const map: Record<ConfidenceLevel, number> = {
    high: 0.86,
    fair: 0.62,
    low: 0.3,
  }
  return map[level]
}

function confidenceReasonKey(
  staleness: StalenessLevel,
  capped: ConfidenceLevel | null,
): string {
  if (staleness === 'very_stale') return 'confidenceReason_very_stale'
  if (staleness === 'stale') return 'confidenceReason_stale'
  if (capped === 'low') return 'confidenceReason_weak'
  if (capped === 'fair') return 'confidenceReason_mixed'
  return 'confidenceReason_fresh_strong'
}

/** Fish-focused narrative for the hero confidence block (v41 copy). */
function catchConfidenceReasonKey(
  staleness: StalenessLevel,
  capped: ConfidenceLevel | null,
): string {
  if (staleness === 'very_stale') return 'reasonVeryStale'
  if (staleness === 'stale') return 'reasonStale'
  if (capped === 'low') return 'reasonLow'
  if (capped === 'fair') return 'reasonFair'
  return 'reasonHigh'
}

function heroGradient(
  state: AdviceScreenState,
  catchTier: CatchTier | null,
): HeroGradient {
  if (state === 'severe') return 'stop'
  if (!catchTier || catchTier === 'nodata') return 'neutral'
  if (catchTier === 'good') return 'good'
  if (catchTier === 'ok') return 'ok'
  return 'low'
}

function resolveCatchHeadlineKey(
  state: AdviceScreenState,
  catchTier: CatchTier | null,
): string {
  if (state === 'severe') return 'v_stop'
  if (state === 'empty') return 'emptyTitle'
  if (state === 'noReachable') return 'noReachableTitle'
  return catchHeadlineKey(catchTier ?? 'nodata')
}

function resolveDecision(input: {
  weather: Weather
  weatherVerdict: WeatherVerdict
  staleness: StalenessLevel
  confidence: ConfidenceLevel | null
  worth: WorthInfo | null
  hasReachable: boolean
}): { decision: Decision; reasonKey: string } {
  const { weather, weatherVerdict: wv, staleness, confidence, worth, hasReachable } =
    input

  if (weather.severeWarning || wv === 'unsafe') {
    return { decision: 'NO_GO', reasonKey: 'decisionReason_unsafe' }
  }

  if (!hasReachable) {
    return { decision: 'NO_GO', reasonKey: 'decisionReason_no_reachable' }
  }

  const caution =
    staleness !== 'fresh' ||
    wv === 'caution' ||
    confidence === 'low' ||
    worth?.verdict === 'not_worth'

  if (caution) {
    if (staleness !== 'fresh') {
      return {
        decision: 'CAUTION',
        reasonKey:
          staleness === 'very_stale'
            ? 'decisionReason_very_stale'
            : 'decisionReason_stale',
      }
    }
    if (wv === 'caution') {
      return { decision: 'CAUTION', reasonKey: 'decisionReason_rough' }
    }
    if (confidence === 'low') {
      return { decision: 'CAUTION', reasonKey: 'decisionReason_low_confidence' }
    }
    if (worth?.verdict === 'not_worth') {
      return { decision: 'CAUTION', reasonKey: 'decisionReason_not_worth' }
    }
    return { decision: 'CAUTION', reasonKey: 'decisionReason_caution' }
  }

  return { decision: 'GO', reasonKey: 'decisionReason_go' }
}

function screenState(
  forecast: Forecast,
  bestZone: Zone | null,
): AdviceScreenState {
  if (!forecast.boat) return 'noBoat'
  if (forecast.weather.severeWarning || forecast.weather.state === 'severe') {
    return 'severe'
  }
  if (forecast.zones.length === 0) return 'empty'
  if (!bestZone) return 'noReachable'
  return 'normal'
}

export function getTodayAdvice(
  forecast: Forecast,
  now: Date,
  options: TodayAdviceOptions = {},
): TodayAdviceView {
  const online = options.online ?? true
  const boat = forecast.boat
  const staleness = getStalenessFromMeta(forecast.meta, now)
  const humanizedAge = relativeTimeParts(forecast.meta.generatedAt, now)
  const wv = weatherVerdict(forecast.weather)
  const bestZone = boat ? bestReachable(forecast.zones, boat) : null
  const state = screenState(forecast, bestZone)
  const outOfRange = boat ? strongerOutOfRange(forecast.zones, boat) : false
  const hasReachable =
    !!boat && hasReachableCatchAboveLow(forecast.zones, boat)

  const primaryAction: PrimaryAction =
    staleness !== 'fresh' && online ? 'refresh' : 'navigate'
  const canRefresh = online

  if (state === 'noBoat') {
    return {
      screenState: state,
      decision: null,
      decisionReasonKey: 'noBoatSub',
      catchHeadlineKey: 'noBoatTitle',
      heroGradient: 'neutral',
      catchConfidenceReasonKey: '',
      bestZone: null,
      catchTier: null,
      confidence: null,
      confidenceReasonKey: '',
      staleness,
      humanizedAge,
      weatherVerdict: wv,
      worth: null,
      strongerOutOfRange: false,
      primaryAction: 'navigate',
      canRefresh,
      mutedCatchPill: false,
    }
  }

  if (state === 'empty') {
    return {
      screenState: state,
      decision: 'NO_GO',
      decisionReasonKey: 'decisionReason_empty',
      catchHeadlineKey: resolveCatchHeadlineKey(state, null),
      heroGradient: heroGradient(state, null),
      catchConfidenceReasonKey: '',
      bestZone: null,
      catchTier: null,
      confidence: null,
      confidenceReasonKey: '',
      staleness,
      humanizedAge,
      weatherVerdict: wv,
      worth: null,
      strongerOutOfRange: false,
      primaryAction,
      canRefresh,
      mutedCatchPill: staleness !== 'fresh',
    }
  }

  if (state === 'noReachable') {
    return {
      screenState: state,
      decision: 'NO_GO',
      decisionReasonKey: 'decisionReason_no_reachable',
      catchHeadlineKey: resolveCatchHeadlineKey(state, null),
      heroGradient: heroGradient(state, null),
      catchConfidenceReasonKey: '',
      bestZone: null,
      catchTier: null,
      confidence: null,
      confidenceReasonKey: '',
      staleness,
      humanizedAge,
      weatherVerdict: wv,
      worth: null,
      strongerOutOfRange: outOfRange,
      primaryAction,
      canRefresh,
      mutedCatchPill: staleness !== 'fresh',
    }
  }

  const rawConf = bestZone?.confidence?.level ?? null
  const confidence = rawConf ? cappedConfidence(rawConf, staleness) : null
  const catchTier = (bestZone?.catch?.tier ?? 'nodata') as CatchTier
  const cappedScore = confidence
    ? cappedConfidenceScore(confidence)
    : (bestZone?.confidence?.score ?? 0)

  const worth =
    boat && bestZone
      ? computeWorth(bestZone, boat, cappedScore, forecast.config)
      : null

  const { decision, reasonKey } = resolveDecision({
    weather: forecast.weather,
    weatherVerdict: wv,
    staleness,
    confidence,
    worth,
    hasReachable,
  })

  const displayTier = catchTier === 'nodata' ? null : catchTier

  return {
    screenState: state,
    decision,
    decisionReasonKey: reasonKey,
    catchHeadlineKey: resolveCatchHeadlineKey(state, catchTier),
    heroGradient: heroGradient(state, displayTier),
    catchConfidenceReasonKey: catchConfidenceReasonKey(staleness, confidence),
    bestZone,
    catchTier: displayTier,
    confidence,
    confidenceReasonKey: confidenceReasonKey(staleness, confidence),
    staleness,
    humanizedAge,
    weatherVerdict: wv,
    worth,
    strongerOutOfRange: outOfRange,
    primaryAction,
    canRefresh,
    mutedCatchPill: staleness !== 'fresh',
  }
}

/** @deprecated Use getTodayAdvice(forecast, now) */
export interface TodayAdvice {
  headlineKey: string
  sublineKey: string
  displayConfidence: ConfidenceLevel | null
  showStaleBanner: boolean
  mutedCatchPill: boolean
  gradient: 'go' | 'caution' | 'stop' | 'neutral'
}

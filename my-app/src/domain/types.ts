export type WeatherState = 'calm' | 'rough' | 'severe'
export type CatchTier = 'good' | 'ok' | 'low' | 'nodata'
export type ConfidenceLevel = 'high' | 'fair' | 'low'
export type DataStatus = 'ok' | 'low_data'
export type Bearing =
  | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
  | 'NNE' | 'ENE' | 'ESE' | 'SSE' | 'SSW' | 'WSW' | 'WNW' | 'NNW'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Boat {
  id: string
  name: string
  rangeKm: number
  gear: string[]
  maxDepthM: number
  fuelLitresPerKm?: number
}

export interface ForecastConfig {
  fuelPricePerLitre: number
  currency: string
}

export interface Coast {
  id: string
  name: string
  harbour: Coordinates
}

export interface CatchInfo {
  tier: CatchTier
  score: number
}

export interface ConfidenceInfo {
  level: ConfidenceLevel
  score: number
  reasons: string[]
}

export interface ZoneSignals {
  sstC: number
  chlorophyll: number
}

export type PresenceBucket = 'quiet' | 'some' | 'busy' | 'very_busy' | 'unknown'
export type CatchShareLevel = 'good' | 'fair' | 'low' | 'unknown'
export type PresenceSource = 'ais' | 'vms' | 'proxy' | 'pfz_fleet' | 'unknown'

export interface ZonePresence {
  boatCount: number | null
  bucket: PresenceBucket
  observedAt: string
  source?: PresenceSource
  confidence?: ConfidenceLevel
}

export interface CatchShareInfo {
  level: CatchShareLevel
  reasonKey: string
}

export interface Zone {
  id: string
  name: string
  center: Coordinates
  distanceKm: number
  bearing: Bearing
  etaMins: number
  depthM: [number, number]
  catch?: CatchInfo
  confidence?: ConfidenceInfo
  signals?: ZoneSignals
  species?: string[]
  gear?: string[]
  presence?: ZonePresence
  catchShare?: CatchShareInfo
  dataStatus: DataStatus
  reason?: string
}

export interface Weather {
  state: WeatherState
  windKts: number
  windDir: string
  waveM: number
  sstC: number
  severeWarning: boolean
}

export interface ForecastMeta {
  generatedAt: string
  source: string
  ttlSeconds: number
}

export interface Accuracy {
  windowDays: number
  correct: number
  history: boolean[]
}

export type Decision = 'GO' | 'CAUTION' | 'NO_GO'
export type WeatherVerdict = 'safe' | 'caution' | 'unsafe'
export type PrimaryAction = 'navigate' | 'refresh'

export interface Forecast {
  meta: ForecastMeta
  coast: Coast
  date: string
  boat?: Boat
  config?: ForecastConfig
  weather: Weather
  zones: Zone[]
  advisory?: { kind: string; text: string } | null
  accuracy: Accuracy
}

export interface ProblemDetail {
  type: string
  title: string
  detail?: string
  status: number
  traceparent?: string
}

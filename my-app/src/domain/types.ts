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

export interface Forecast {
  meta: ForecastMeta
  coast: Coast
  date: string
  boat?: Boat
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

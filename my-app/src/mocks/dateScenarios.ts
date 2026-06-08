import { parseLocalDate, todayIsoDate } from '@/lib/format/time'
import type { Forecast } from '@/domain/types'
import calm from './fixtures/forecast.calm.json'
import severe from './fixtures/forecast.severe.json'

export type DemoDateScenario =
  | 'go'
  | 'caution_stale'
  | 'caution_rough'
  | 'no_go_severe'
  | 'caution_marginal'

export function dateOffsetFromToday(isoDate: string, now = new Date()): number {
  const target = parseLocalDate(isoDate)
  const today = parseLocalDate(todayIsoDate(now))
  if (!target || !today) return 0
  return Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  )
}

/** Map picker offset → demo scenario (dummy data, no live API). */
export function demoScenarioForDate(isoDate: string, now = new Date()): DemoDateScenario {
  switch (dateOffsetFromToday(isoDate, now)) {
    case -1:
      return 'caution_stale'
    case 0:
      return 'go'
    case 1:
      return 'caution_rough'
    case 2:
      return 'no_go_severe'
    case 3:
      return 'caution_marginal'
    default:
      return 'go'
  }
}

function hoursAgoIso(hours: number, now: Date): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
}

function cloneCalm(): Forecast {
  return JSON.parse(JSON.stringify(calm)) as Forecast
}

export function demoScenarioHintKey(isoDate: string, now = new Date()): string {
  return `demoDay_${demoScenarioForDate(isoDate, now)}`
}

export function buildDateScenarioForecast(
  scenario: DemoDateScenario,
  now = new Date(),
): Forecast {
  switch (scenario) {
    case 'go': {
      const f = cloneCalm()
      f.meta = { ...f.meta, generatedAt: hoursAgoIso(2, now) }
      return f
    }
    case 'caution_stale': {
      const f = cloneCalm()
      f.meta = { ...f.meta, generatedAt: hoursAgoIso(30, now) }
      return f
    }
    case 'caution_rough': {
      const f = cloneCalm()
      f.weather = {
        ...f.weather,
        state: 'rough',
        windKts: 28,
        waveM: 2.4,
        severeWarning: false,
      }
      f.meta = { ...f.meta, generatedAt: hoursAgoIso(1, now) }
      return f
    }
    case 'no_go_severe': {
      const f = JSON.parse(JSON.stringify(severe)) as Forecast
      f.meta = { ...f.meta, generatedAt: hoursAgoIso(1, now) }
      return f
    }
    case 'caution_marginal': {
      const f = cloneCalm()
      const munambam = f.zones.find((z) => z.id === 'KL-712')
      if (munambam?.catch) {
        munambam.catch = { tier: 'ok', score: 0.58 }
        munambam.distanceKm = 46
        munambam.confidence = {
          level: 'fair',
          score: 0.55,
          reasons: ['mixed_signal'],
        }
      }
      f.meta = { ...f.meta, generatedAt: hoursAgoIso(4, now) }
      return f
    }
  }
}

export type RelativeTimeKey =
  | 'justNow'
  | 'minAgo'
  | 'hoursAgo'
  | 'yesterday'
  | 'daysAgo'

export interface RelativeTimeResult {
  key: RelativeTimeKey
  count?: number
}

export function relativeTimeParts(
  date: string | Date,
  now: Date,
): RelativeTimeResult {
  const ms = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(ms / 60000)

  if (minutes < 1) return { key: 'justNow' }
  if (minutes < 90) return { key: 'minAgo', count: minutes }

  const hours = Math.round(minutes / 60)
  if (hours < 48) return { key: 'hoursAgo', count: hours }

  const days = Math.floor(minutes / (60 * 24))
  if (days === 1) return { key: 'yesterday' }
  return { key: 'daysAgo', count: days }
}

type TranslateFn = (key: string, opts?: Record<string, string | number>) => string

export function formatRelativeTime(
  date: string | Date,
  now: Date,
  t: TranslateFn,
): string {
  const { key, count } = relativeTimeParts(date, now)
  if (count !== undefined) return t(key, { count })
  return t(key)
}

/** Local calendar date as YYYY-MM-DD (for API queries and day labels). */
export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type DayLabelKey = 'dayToday' | 'dayTomorrow' | 'formatted'

export interface DayLabelResult {
  key: DayLabelKey
  formatted?: string
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Parse YYYY-MM-DD (or a datetime string with that prefix) as local noon. */
export function parseLocalDate(isoDate: string): Date | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const d = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0,
    0,
  )
  return Number.isFinite(d.getTime()) ? d : null
}

export function dayLabelParts(isoDate: string, now: Date): DayLabelResult {
  const parsed = parseLocalDate(isoDate)
  if (!parsed) return { key: 'formatted', formatted: isoDate }

  const target = startOfLocalDay(parsed)
  const today = startOfLocalDay(now)
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  )

  if (diffDays === 0) return { key: 'dayToday' }
  if (diffDays === 1) return { key: 'dayTomorrow' }

  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(parsed)

  return { key: 'formatted', formatted }
}

export function formatDay(
  isoDate: string,
  now: Date,
  locale: string,
  t: TranslateFn,
): string {
  const parsed = parseLocalDate(isoDate)
  if (!parsed) return isoDate

  const { key } = dayLabelParts(isoDate, now)
  if (key === 'formatted') {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(parsed)
  }
  return t(key)
}

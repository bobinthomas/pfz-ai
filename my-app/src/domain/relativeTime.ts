export type RelativeTimeKey =
  | 'justNow'
  | 'minAgo'
  | 'hoursAgo'
  | 'yesterday'
  | 'daysAgo'

export interface RelativeTimeParts {
  key: RelativeTimeKey
  count?: number
}

export function relativeTimeParts(
  date: string | Date,
  now: Date,
): RelativeTimeParts {
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

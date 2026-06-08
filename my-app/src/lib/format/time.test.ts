import { describe, expect, it } from 'vitest'
import {
  dayLabelParts,
  formatDay,
  formatRelativeTime,
  relativeTimeParts,
  todayIsoDate,
} from './time'

const t = (key: string, opts?: Record<string, string | number>) => {
  const map: Record<string, string> = {
    justNow: 'just now',
    minAgo: `${opts?.count} min ago`,
    hoursAgo: `about ${opts?.count} hours ago`,
    yesterday: 'yesterday',
    daysAgo: `${opts?.count} days ago`,
    dayToday: 'Today',
    dayTomorrow: 'Tomorrow',
  }
  return map[key] ?? key
}

describe('relativeTimeParts', () => {
  const generated = '2026-06-05T22:12:00Z'

  it('uses minutes only under 90 min', () => {
    const now = new Date('2026-06-05T22:50:00Z')
    expect(relativeTimeParts(generated, now)).toEqual({ key: 'minAgo', count: 38 })
  })

  it('uses hours at 29h old', () => {
    const now = new Date('2026-06-07T03:12:00Z')
    expect(relativeTimeParts(generated, now)).toEqual({ key: 'hoursAgo', count: 29 })
  })

  it('never returns minutes above 90', () => {
    const now = new Date('2026-06-06T00:00:00Z')
    const parts = relativeTimeParts(generated, now)
    expect(parts.key).not.toBe('minAgo')
  })
})

describe('formatRelativeTime', () => {
  it('renders about 29 hours ago', () => {
    const text = formatRelativeTime(
      '2026-06-05T22:12:00Z',
      new Date('2026-06-07T03:12:00Z'),
      t,
    )
    expect(text).toBe('about 29 hours ago')
  })
})

describe('todayIsoDate', () => {
  it('returns local YYYY-MM-DD', () => {
    expect(todayIsoDate(new Date(2026, 5, 8, 15, 30))).toBe('2026-06-08')
  })
})

describe('formatDay', () => {
  it('returns Today for same calendar day', () => {
    const now = new Date(2026, 5, 7, 10, 0, 0)
    expect(formatDay('2026-06-07', now, 'en', t)).toBe('Today')
    expect(dayLabelParts('2026-06-07', now).key).toBe('dayToday')
  })

  it('returns Tomorrow for next day', () => {
    const now = new Date(2026, 5, 7, 10, 0, 0)
    expect(formatDay('2026-06-08', now, 'en', t)).toBe('Tomorrow')
  })

  it('falls back safely for non-date placeholders', () => {
    expect(formatDay('…', new Date(), 'en', t)).toBe('…')
    expect(dayLabelParts('…', new Date()).formatted).toBe('…')
  })

  it('parses datetime strings with a date prefix', () => {
    const now = new Date(2026, 5, 7, 10, 0, 0)
    expect(formatDay('2026-06-07T05:12:00Z', now, 'en', t)).toBe('Today')
  })
})

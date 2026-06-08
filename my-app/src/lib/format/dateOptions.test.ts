import { describe, expect, it } from 'vitest'
import { buildDateOptions } from './dateOptions'
import { todayIsoDate } from './time'

describe('buildDateOptions', () => {
  it('includes yesterday through three days ahead', () => {
    const now = new Date(2026, 5, 8, 12, 0, 0)
    expect(buildDateOptions(now)).toEqual([
      '2026-06-07',
      '2026-06-08',
      '2026-06-09',
      '2026-06-10',
      '2026-06-11',
    ])
    expect(buildDateOptions(now)[1]).toBe(todayIsoDate(now))
  })
})

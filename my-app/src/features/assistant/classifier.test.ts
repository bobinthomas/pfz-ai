import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import type { Forecast } from '@/domain/types'
import { buildReply, classifyReply } from './classifier'

const forecast = calm as Forecast
const t = (key: string, opts?: Record<string, unknown>) => {
  if (key === 'assistant:redirect') return 'redirect message'
  if (key === 'assistant:tunaYes') return `tuna at ${opts?.zone}`
  if (key === 'assistant:bestToday') return `best: ${opts?.zone}`
  return key
}

describe('classifier', () => {
  it('redirects out-of-scope questions', () => {
    expect(classifyReply('cricket score')).toBe('redirect')
    expect(buildReply('cricket score', forecast, t)).toBe('redirect message')
  })

  it('answers in-scope tuna question from forecast', () => {
    const reply = buildReply('Where are the tuna?', forecast, t)
    expect(reply).toContain('Munambam')
  })

  it('answers best catch from forecast', () => {
    const reply = buildReply('Best catch today?', forecast, t)
    expect(reply).toContain('Munambam')
  })
})

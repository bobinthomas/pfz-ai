import { describe, expect, it } from 'vitest'
import {
  cappedConfidence,
  getStaleness,
  getStalenessFromMeta,
} from './staleness'

const TTL = 21600 // 6h

describe('getStaleness', () => {
  const generatedAt = '2026-06-07T05:12:00Z'

  it('returns fresh within ttl', () => {
    const now = new Date('2026-06-07T10:00:00Z')
    expect(getStaleness(generatedAt, TTL, now)).toBe('fresh')
  })

  it('returns stale when age exceeds ttl but under 24h', () => {
    const now = new Date('2026-06-07T12:00:00Z') // ~6.8h
    expect(getStaleness(generatedAt, TTL, now)).toBe('stale')
  })

  it('returns very_stale when age exceeds 24h', () => {
    const now = new Date('2026-06-08T06:12:00Z') // 25h
    expect(getStaleness(generatedAt, TTL, now)).toBe('very_stale')
  })

  it('returns stale at exactly 24h and very_stale beyond', () => {
    const at24h = new Date('2026-06-08T05:12:00Z')
    const beyond = new Date('2026-06-08T05:13:00Z')
    expect(getStaleness(generatedAt, TTL, at24h)).toBe('stale')
    expect(getStaleness(generatedAt, TTL, beyond)).toBe('very_stale')
  })
})

describe('getStalenessFromMeta', () => {
  it('matches getStaleness for fixture meta', () => {
    const meta = {
      generatedAt: '2026-06-05T22:12:00Z',
      source: 'INCOIS',
      ttlSeconds: TTL,
    }
    const now = new Date('2026-06-07T03:12:00Z') // ~29h
    expect(getStalenessFromMeta(meta, now)).toBe('very_stale')
  })
})

describe('cappedConfidence', () => {
  it('leaves fresh confidence unchanged', () => {
    expect(cappedConfidence('high', 'fresh')).toBe('high')
    expect(cappedConfidence('fair', 'fresh')).toBe('fair')
    expect(cappedConfidence('low', 'fresh')).toBe('low')
  })

  it('caps high to fair when stale', () => {
    expect(cappedConfidence('high', 'stale')).toBe('fair')
    expect(cappedConfidence('fair', 'stale')).toBe('fair')
    expect(cappedConfidence('low', 'stale')).toBe('low')
  })

  it('caps any level to low when very_stale', () => {
    expect(cappedConfidence('high', 'very_stale')).toBe('low')
    expect(cappedConfidence('fair', 'very_stale')).toBe('low')
    expect(cappedConfidence('low', 'very_stale')).toBe('low')
  })
})

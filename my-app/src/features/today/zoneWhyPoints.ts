import type { Zone } from '@/domain/types'

const FALLBACK_KEYS = ['whyPoint1', 'whyPoint3', 'whyPoint4'] as const

export function zoneWhyPoints(
  zone: Zone,
  reasonLabel: (reasonKey: string) => string,
  todayLabel: (key: string) => string,
): string[] {
  const fromReasons = (zone.confidence?.reasons ?? [])
    .slice(0, 3)
    .map((r) => reasonLabel(r))
    .filter((s) => s && !s.startsWith('confidence:'))

  if (fromReasons.length >= 3) return fromReasons.slice(0, 3)

  const fallbacks = FALLBACK_KEYS.map((k) => todayLabel(k))
  return [...fromReasons, ...fallbacks].slice(0, 3)
}

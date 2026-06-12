import type { CatchShareInfo, CatchShareLevel, PresenceBucket, Zone } from './types'

export interface ZoneCrowdingView {
  presence: Zone['presence']
  share: CatchShareInfo
}

const CROWDING_FACTOR: Record<PresenceBucket, number> = {
  quiet: 1,
  some: 0.85,
  busy: 0.6,
  very_busy: 0.35,
  unknown: 1,
}

export function bucketFromCount(count: number): PresenceBucket {
  if (count <= 2) return 'quiet'
  if (count <= 5) return 'some'
  if (count <= 10) return 'busy'
  return 'very_busy'
}

export function crowdingFactor(bucket: PresenceBucket): number {
  return CROWDING_FACTOR[bucket]
}

export function computeCatchShare(zone: Zone): CatchShareInfo {
  const presence = zone.presence
  if (!presence || presence.bucket === 'unknown') {
    return { level: 'unknown', reasonKey: 'shareUnknown' }
  }

  const catchScore = zone.catch?.score ?? 0
  const adjusted = catchScore * crowdingFactor(presence.bucket)

  if (adjusted >= 0.55) return { level: 'good', reasonKey: 'shareGood' }
  if (adjusted >= 0.35) return { level: 'fair', reasonKey: 'shareFair' }
  return { level: 'low', reasonKey: 'shareLow' }
}

export function resolveZoneCrowding(zone: Zone): ZoneCrowdingView {
  const share = zone.catchShare ?? computeCatchShare(zone)
  return { presence: zone.presence, share }
}

export function presenceLabelKey(bucket: PresenceBucket): string {
  if (bucket === 'unknown') return 'presenceUnknown'
  return `presence_${bucket}`
}

export function shareLabelKey(level: CatchShareLevel): string {
  if (level === 'unknown') return 'shareUnknownShort'
  return `share_${level}`
}

export function shareColor(level: CatchShareLevel): string {
  switch (level) {
    case 'good':
      return 'var(--good)'
    case 'fair':
      return 'var(--low)'
    case 'low':
      return 'var(--stop)'
    default:
      return 'var(--ink2)'
  }
}

export function shareBg(level: CatchShareLevel): string {
  switch (level) {
    case 'good':
      return 'var(--good-bg)'
    case 'fair':
      return 'var(--low-bg)'
    case 'low':
      return '#f4e3e1'
    default:
      return 'var(--soft)'
  }
}

export function presenceColor(bucket: PresenceBucket): string {
  switch (bucket) {
    case 'quiet':
      return 'var(--good)'
    case 'some':
      return 'var(--ok)'
    case 'busy':
      return 'var(--low)'
    case 'very_busy':
      return 'var(--stop)'
    default:
      return 'var(--ink2)'
  }
}

/** Demo helper: attach presence to ok zones when fixtures omit it. */
export function withDefaultPresence(
  zones: Zone[],
  now = new Date(),
): Zone[] {
  const defaults: Record<string, { count: number; bucket: PresenceBucket }> = {
    'KL-712': { count: 2, bucket: 'quiet' },
    'KL-842': { count: 4, bucket: 'some' },
    'KL-901': { count: 1, bucket: 'quiet' },
    'KL-455': { count: 7, bucket: 'busy' },
  }

  return zones.map((z) => {
    if (z.dataStatus !== 'ok' || z.presence) return z
    const d = defaults[z.id]
    if (!d) return z
    const presence = {
      boatCount: d.count,
      bucket: d.bucket,
      observedAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
      source: 'proxy' as const,
      confidence: 'fair' as const,
    }
    return { ...z, presence, catchShare: computeCatchShare({ ...z, presence }) }
  })
}

export function applyPresenceToZone(
  zone: Zone,
  count: number,
  observedAt: string,
): Zone {
  const presence = {
    boatCount: count,
    bucket: bucketFromCount(count),
    observedAt,
    source: 'proxy' as const,
    confidence: 'fair' as const,
  }
  return {
    ...zone,
    presence,
    catchShare: computeCatchShare({ ...zone, presence }),
  }
}

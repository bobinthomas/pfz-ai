import { Ship, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  presenceColor,
  presenceLabelKey,
  resolveZoneCrowding,
  shareBg,
  shareColor,
  shareLabelKey,
  type Zone,
} from '@/domain'
import { formatRelativeTime } from '@/lib/format/time'

interface PresenceShareChipsProps {
  zone: Zone
  compact?: boolean
  showUpdated?: boolean
}

export function PresenceShareChips({
  zone,
  compact = false,
  showUpdated = false,
}: PresenceShareChipsProps) {
  const { t } = useTranslation('today')
  const { presence, share } = resolveZoneCrowding(zone)
  const now = new Date()

  if (!presence && share.level === 'unknown') return null

  const presenceText =
    presence?.boatCount != null
      ? t('presenceCount', { count: presence.boatCount })
      : t(presenceLabelKey(presence?.bucket ?? 'unknown'))

  const updated =
    showUpdated && presence?.observedAt
      ? formatRelativeTime(presence.observedAt, now, (k, o) => t(k, o))
      : null

  const chipClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-extrabold'
    : 'inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-extrabold'

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'gap-2.5'}`}>
      {presence && (
        <span
          className={chipClass}
          style={{
            color: presenceColor(presence.bucket),
            background: 'var(--soft)',
          }}
        >
          <Ship className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
          {presenceText}
          {updated && (
            <span className="font-semibold opacity-80">· {updated}</span>
          )}
        </span>
      )}
      {share.level !== 'unknown' && (
        <span
          className={chipClass}
          style={{ color: shareColor(share.level), background: shareBg(share.level) }}
        >
          <Target className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
          {t('yourChance')}: {t(shareLabelKey(share.level))}
        </span>
      )}
    </div>
  )
}

interface PresenceShareBlockProps {
  zone: Zone
}

/** Drawer / hero block with presence count + share narrative. */
export function PresenceShareBlock({ zone }: PresenceShareBlockProps) {
  const { t } = useTranslation('today')
  const { presence, share } = resolveZoneCrowding(zone)
  const now = new Date()

  if (!presence && share.level === 'unknown') {
    return (
      <div className="rounded-2xl border border-dashed border-line2 bg-soft px-4 py-3 text-sm font-semibold text-ink2">
        {t('presenceUnknown')}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-soft p-4">
      <h3 className="font-display text-base font-bold text-ink">{t('boatsAtSpot')}</h3>
      {presence && (
        <p className="mt-2 flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
          <Ship className="h-6 w-6 text-teal" aria-hidden />
          {presence.boatCount != null
            ? t('presenceCount', { count: presence.boatCount })
            : t(presenceLabelKey(presence.bucket))}
        </p>
      )}
      {presence?.observedAt && (
        <p className="mt-1 text-sm font-semibold text-ink2">
          {t('presenceUpdated', {
            age: formatRelativeTime(presence.observedAt, now, (k, o) => t(k, o)),
          })}
        </p>
      )}
      {share.level !== 'unknown' && (
        <p
          className="mt-3 border-t border-line pt-3 text-sm font-semibold leading-relaxed"
          style={{ color: shareColor(share.level) }}
        >
          <span className="font-extrabold text-ink">
            {t('yourChance')}: {t(shareLabelKey(share.level))}
          </span>
          {' — '}
          {t(share.reasonKey)}
        </p>
      )}
    </div>
  )
}

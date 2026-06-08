import { ChevronRight, CloudOff, Layers } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  confidenceDots,
  confidenceLabelKey,
  gearFits,
  getZoneDisplayAdvice,
  groupZonesForTabs,
  isReachable,
  zoneFuelEstimate,
  zoneTabIndicatorDots,
  zoneTabLabelKey,
  type Boat,
  type ForecastConfig,
  type StalenessLevel,
  type Zone,
  type ZoneTabGroupKey,
} from '@/domain'
import { buildZoneLetterMap } from '@/lib/utils/zoneLetters'
import { confidenceColor, tierBg, tierColor } from '@/lib/utils/tier'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { tierPillLabel } from './tierLabels'

interface ZonesRailProps {
  zones: Zone[]
  boat: Boat
  config?: ForecastConfig
  bestZoneId?: string
  disabled?: boolean
  dataStaleness: StalenessLevel
  onSelect: (zone: Zone) => void
}

function tabAccentColor(key: ZoneTabGroupKey): string {
  if (key === 'low_data') return 'var(--nodata)'
  return tierColor(key)
}

function tabAccentBg(key: ZoneTabGroupKey): string {
  if (key === 'low_data') return tierBg('nodata')
  return tierBg(key)
}

function partitionByRange(zones: Zone[], boat: Boat) {
  const inRange: Zone[] = []
  const beyond: Zone[] = []
  for (const z of zones) {
    if (z.dataStatus === 'low_data' || isReachable(z, boat)) inRange.push(z)
    else beyond.push(z)
  }
  return { inRange, beyond }
}

interface ZonePanelProps {
  zone: Zone
  letter: string
  boat: Boat
  config?: ForecastConfig
  isBest?: boolean
  disabled?: boolean
  isLast: boolean
  muted?: boolean
  dataStaleness: StalenessLevel
  onSelect: (zone: Zone) => void
  t: (key: string, opts?: Record<string, string | number>) => string
}

function ZonePanel({
  zone,
  letter,
  boat,
  config,
  isBest,
  disabled,
  isLast,
  muted,
  dataStaleness,
  onSelect,
  t,
}: ZonePanelProps) {
  if (zone.dataStatus === 'low_data') {
    return (
      <div
        className={`px-4 py-4 ${!isLast ? 'border-b border-line' : ''}`}
        aria-disabled="true"
      >
        <div className="zone-top flex items-start gap-3">
          <div className="zmark grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[13px] bg-nodata font-display text-lg font-extrabold text-white">
            {letter}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold">{zone.name}</div>
            <div className="text-xs font-semibold text-ink2">
              {zone.id} · {zone.distanceKm} km {zone.bearing}
            </div>
          </div>
        </div>
        <div className="lowdata mt-3 flex items-center gap-2.5 rounded-[13px] border border-dashed border-line2 bg-soft px-4 py-3 text-sm font-semibold text-ink2">
          <CloudOff className="h-5 w-5 shrink-0 text-nodata" />
          {t('lowData')}
        </div>
      </div>
    )
  }

  const advice = getZoneDisplayAdvice(zone, dataStaleness)
  const tier = advice.catchTier
  const displayLevel = advice.displayConfidence
  const badgeColor = muted || advice.mutedCatchPill ? 'var(--ink2)' : tierColor(tier)
  const suitsGear = gearFits(zone, boat)
  const fuel = zoneFuelEstimate(zone, boat, config)

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={t('openZone', { name: zone.name })}
      onClick={() => !disabled && onSelect(zone)}
      className={`w-full cursor-pointer px-4 py-4 text-left transition-colors hover:bg-soft disabled:pointer-events-none ${
        !isLast ? 'border-b border-line' : ''
      } ${muted ? 'opacity-55' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[13px] font-display text-lg font-extrabold text-white"
          style={{ background: badgeColor }}
        >
          {letter}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-bold text-ink">{zone.name}</span>
            {isBest && (
              <span className="rounded-[var(--radius-pill)] bg-teal/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-teal">
                {t('bestMarker')}
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-ink2">
            {zone.id} · {zone.distanceKm} km {zone.bearing}
            {muted && ` · ${t('tooFar')}`}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="inline-flex rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-extrabold"
              style={{
                color: advice.mutedCatchPill ? 'var(--ink2)' : tierColor(tier),
                background: advice.mutedCatchPill ? 'var(--soft)' : tierBg(tier),
              }}
            >
              {tierPillLabel(tier, (k) => t(k))}
            </span>
            {displayLevel && (
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-extrabold"
                style={{
                  color: confidenceColor(displayLevel),
                  background: 'var(--soft)',
                }}
              >
                {t('howSure')}: {t(`confidence:${confidenceLabelKey(displayLevel)}`)}
                <ConfidenceMeter
                  dots={confidenceDots(displayLevel)}
                  color={confidenceColor(displayLevel)}
                />
              </span>
            )}
            {suitsGear && (
              <span className="inline-flex rounded-[var(--radius-pill)] bg-soft px-2.5 py-1 text-xs font-extrabold text-teal">
                {t('suitsNets')}
              </span>
            )}
            <span className="inline-flex rounded-[var(--radius-pill)] bg-soft px-2.5 py-1 text-xs font-extrabold text-ink2">
              {t('zoneFuelEstimate', {
                cost: fuel.fuelCost,
                km: fuel.roundTripKm,
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <div className="min-w-[96px] flex-1 rounded-xl bg-soft px-3 py-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink2">
            {t('water')}
          </div>
          <div className="mt-0.5 font-display text-base font-bold">
            {zone.signals ? `${zone.signals.sstC}°C` : '—'}
          </div>
        </div>
        <div className="min-w-[96px] flex-1 rounded-xl bg-soft px-3 py-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink2">
            {t('fishHere')}
          </div>
          <div className="mt-0.5 text-sm font-bold">
            {(zone.species ?? []).map((s) => t(`species:${s}`)).join(', ')}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink2" aria-hidden />
      </div>
    </button>
  )
}

export function ZonesRail({
  zones,
  boat,
  config,
  bestZoneId,
  disabled,
  dataStaleness,
  onSelect,
}: ZonesRailProps) {
  const { t } = useTranslation(['today', 'species', 'confidence'])
  const letters = buildZoneLetterMap(zones, boat)
  const groups = useMemo(() => groupZonesForTabs(zones, boat), [zones, boat])
  const [activeKey, setActiveKey] = useState<ZoneTabGroupKey>(
    () => groups[0]?.key ?? 'good',
  )

  useEffect(() => {
    if (!groups.some((g) => g.key === activeKey)) {
      setActiveKey(groups[0]?.key ?? 'good')
    }
  }, [groups, activeKey])

  const activeGroup = groups.find((g) => g.key === activeKey)
  const { inRange, beyond } = activeGroup
    ? partitionByRange(activeGroup.zones, boat)
    : { inRange: [], beyond: [] }

  return (
    <section aria-labelledby="zones-heading">
      <div className="mb-2.5 flex items-center gap-2.5 px-1">
        <Layers className="h-[19px] w-[19px] text-ink2" aria-hidden />
        <h2 id="zones-heading" className="font-display text-[19px] font-bold text-ink">
          {t('zonesToday')}
        </h2>
      </div>
      <div
        className="overflow-hidden rounded-[20px] border-[1.5px] border-line bg-card"
        style={{ opacity: disabled ? 0.55 : 1 }}
      >
        <div
          role="tablist"
          aria-label={t('zonesToday')}
          className="flex gap-1 overflow-x-auto border-b border-line bg-soft/60 p-2"
        >
          {groups.map((group) => {
            const selected = group.key === activeKey
            const color = tabAccentColor(group.key)
            const bg = tabAccentBg(group.key)
            const label = t(zoneTabLabelKey(group.key))
            const dots = zoneTabIndicatorDots(group.key)

            return (
              <button
                key={group.key}
                type="button"
                role="tab"
                id={`likelihood-tab-${group.key}`}
                aria-selected={selected}
                aria-controls={`likelihood-panel-${group.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveKey(group.key)}
                className={`flex min-h-[var(--touch-min)] min-w-[6.75rem] shrink-0 flex-col gap-1.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? 'bg-card shadow-sm ring-1 ring-line'
                    : 'text-ink2 hover:bg-card/70'
                }`}
                aria-label={t('likelihoodTab', {
                  label,
                  count: group.zones.length,
                })}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={`min-w-0 flex-1 text-[13px] font-bold leading-tight ${
                      selected ? 'text-ink' : 'text-ink2'
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className="grid min-w-[1.6rem] shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold"
                    style={{ color, background: bg }}
                  >
                    {group.zones.length}
                  </span>
                </div>
                <div className="flex w-full items-center">
                  {group.key === 'low_data' ? (
                    <CloudOff className="h-4 w-4 text-nodata" aria-hidden />
                  ) : (
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <i
                          key={i}
                          className="inline-block rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background: i < dots ? color : 'rgba(0,0,0,0.12)',
                          }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {activeGroup && (
          <div
            role="tabpanel"
            id={`likelihood-panel-${activeGroup.key}`}
            aria-labelledby={`likelihood-tab-${activeGroup.key}`}
          >
            {inRange.map((zone, idx) => (
              <ZonePanel
                key={zone.id}
                zone={zone}
                letter={letters.get(zone.id) ?? '?'}
                boat={boat}
                config={config}
                isBest={zone.id === bestZoneId}
                disabled={disabled}
                isLast={idx === inRange.length - 1 && beyond.length === 0}
                dataStaleness={dataStaleness}
                onSelect={onSelect}
                t={(key, opts) => t(key, opts)}
              />
            ))}
            {beyond.length > 0 && (
              <>
                <div className="border-b border-line bg-soft/80 px-4 py-2.5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-ink2">
                    {t('beyondRange')}
                  </p>
                </div>
                {beyond.map((zone, idx) => (
                  <ZonePanel
                    key={zone.id}
                    zone={zone}
                    letter={letters.get(zone.id) ?? '?'}
                    boat={boat}
                    config={config}
                    disabled={disabled}
                    muted
                    isLast={idx === beyond.length - 1}
                    dataStaleness={dataStaleness}
                    onSelect={onSelect}
                    t={(key, opts) => t(key, opts)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

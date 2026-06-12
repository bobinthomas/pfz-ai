import { useQueryClient } from '@tanstack/react-query'
import { Bookmark, Check, Compass, Fish, Grid2x2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer } from '@/components/ui/Drawer'
import { Pill } from '@/components/ui/Pill'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import {
  confidenceDots,
  confidenceLabelKey,
  displayConfidenceForZone,
  gearFits,
  isReachable,
  zoneFuelEstimate,
  type Boat,
  type ForecastConfig,
  type StalenessLevel,
  type Weather,
  type Zone,
} from '@/domain'
import { useConnectivityStore } from '@/lib/offline/connectivity'
import { enqueueSave } from '@/lib/offline/outbox'
import { SAVED_SPOTS_KEY } from '@/lib/trips/useSavedSpots'
import { formatEta } from '@/lib/utils/bearing'
import { confidenceColor, tierBg, tierColor } from '@/lib/utils/tier'
import { PresenceShareBlock } from './PresenceShareChips'
import { tierPillLabel } from './tierLabels'
import { zoneWhyPoints } from './zoneWhyPoints'

interface ZoneDetailDrawerProps {
  zone: Zone | null
  letter: string
  boat: Boat
  weather: Weather
  config?: ForecastConfig
  dataStaleness?: StalenessLevel
  onClose: () => void
}

export function ZoneDetailDrawer({
  zone,
  letter,
  boat,
  weather,
  config,
  dataStaleness = 'fresh',
  onClose,
}: ZoneDetailDrawerProps) {
  const { t } = useTranslation(['today', 'confidence', 'species', 'gear'])
  const online = useConnectivityStore((s) => s.online)
  const queryClient = useQueryClient()
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  if (!zone || zone.dataStatus === 'low_data') return null

  const tier = zone.catch?.tier ?? 'nodata'
  const mutedCatch = dataStaleness !== 'fresh'
  const displayLevel = displayConfidenceForZone(zone, dataStaleness)
  const reachable = isReachable(zone, boat)
  const fuel = zoneFuelEstimate(zone, boat, config)
  const species =
    (zone.species ?? []).map((s) => t(`species:${s}`)).join(', ') ||
    t('fishHere')
  const whyPoints = zoneWhyPoints(
    zone,
    (r) => t(`confidence:reason_${r}`),
    (k) => t(k),
  )

  async function handleSave() {
    await enqueueSave(zone!.id, zone!.name)
    await queryClient.invalidateQueries({ queryKey: SAVED_SPOTS_KEY })
    setSaveMsg(online ? t('saveDone') : t('saveQueued'))
    setTimeout(() => setSaveMsg(null), 4000)
  }

  function handleNavigate() {
    const { lat, lng } = zone!.center
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener')
  }

  return (
    <Drawer
      open={!!zone}
      onClose={onClose}
      title={zone.name}
      icon={
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-base font-extrabold text-white"
          style={{ backgroundColor: mutedCatch ? 'var(--ink2)' : tierColor(tier) }}
        >
          {letter}
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap gap-2">
          <Pill
            color={mutedCatch ? 'var(--ink2)' : tierColor(tier)}
            bg={mutedCatch ? 'var(--soft)' : tierBg(tier)}
          >
            {tierPillLabel(tier, (k) => t(k))}
          </Pill>
          {displayLevel && (
            <Pill color={confidenceColor(displayLevel)} bg="var(--soft)">
              {t('howSure')}: {t(`confidence:${confidenceLabelKey(displayLevel)}`)}
              <ConfidenceMeter
                dots={confidenceDots(displayLevel)}
                color={confidenceColor(displayLevel)}
              />
            </Pill>
          )}
          {!reachable && (
            <Pill color="var(--low)" bg="var(--low-bg)">
              {t('tooFar')}
            </Pill>
          )}
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-teal">
            {t('speciesCatch')}
          </p>
          <p className="font-display text-3xl font-extrabold leading-tight text-ink">
            {species}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink2">
            {zone.id} · {zone.distanceKm} km {zone.bearing} · {formatEta(zone.etaMins)} ·{' '}
            {zone.center.lat.toFixed(2)}° N, {zone.center.lng.toFixed(2)}° E
          </p>
        </div>

        <PresenceShareBlock zone={zone} />

        <div className="rounded-2xl border border-line bg-soft p-4">
          <h3 className="font-display text-base font-bold text-ink">
            {t('whyFishTitle')}
          </h3>
          <ul className="mt-3 space-y-2">
            {whyPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-relaxed text-ink2">
                <span className="text-teal" aria-hidden>
                  •
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            label={t('water')}
            value={zone.signals ? `${zone.signals.sstC}°C` : '—'}
            sub={t('tempVs')}
          />
          <Metric
            label={t('fishFood')}
            value={zone.signals ? String(zone.signals.chlorophyll) : '—'}
            sub={t('fishFoodGood')}
            subColor="var(--good)"
          />
          <Metric
            label={t('wind')}
            value={`${weather.windKts} kts`}
            sub={weather.windDir}
            dark
          />
          <Metric
            label={t('fromShore')}
            value={`${zone.distanceKm} km`}
            sub={`${zone.depthM[0]}–${zone.depthM[1]} m ${t('depthLabel')}`}
          />
        </div>

        <div className="rounded-2xl border border-line bg-soft px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink2">
            {t('worthTrip')}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink">
            ≈ {fuel.fuelLitres} L · ≈ ₹{fuel.fuelCost} · {fuel.roundTripKm} km{' '}
            {t('worthRoundTrip')}
          </p>
        </div>

        <h3 className="font-display text-lg font-bold text-ink">{t('whatUse')}</h3>
        {(zone.gear ?? []).map((g) => {
          const matched = boat.gear.includes(g)
          return (
            <div
              key={g}
              className="flex gap-3 rounded-2xl border border-line bg-card p-4"
            >
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-soft text-teal">
                {g === 'longline' ? (
                  <Fish className="h-5 w-5" />
                ) : (
                  <Grid2x2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-ink">
                  {t(`gear:${g}`)}
                  {matched && (
                    <span className="rounded-md bg-good-bg px-2 py-0.5 text-xs font-extrabold text-good">
                      {t('yourNet')}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink2">
                  {t('gearDesc', { species, gear: t(`gear:${g}`) })}
                </p>
              </div>
            </div>
          )
        })}

        {gearFits(zone, boat) === false && (
          <p className="text-sm text-ink2">{t('gearNoMatch')}</p>
        )}

        {saveMsg && (
          <p
            className="flex items-center gap-2 rounded-xl bg-good-bg px-4 py-3 text-sm font-bold text-good"
            role="status"
          >
            <Check className="h-4 w-4" />
            {saveMsg}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={handleNavigate}
            className="flex min-h-[58px] items-center justify-center gap-2.5 rounded-[15px] bg-navy font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <Compass className="h-5 w-5" />
            {t('navigate')}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className="flex min-h-[58px] items-center justify-center gap-2.5 rounded-[15px] border border-line2 bg-card font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <Bookmark className="h-5 w-5" />
            {t('save')}
          </button>
        </div>
        <p className="px-2 text-center text-sm leading-relaxed text-ink2">{t('disc')}</p>
      </div>
    </Drawer>
  )
}

function Metric({
  label,
  value,
  sub,
  subColor,
  dark,
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${dark ? 'bg-navy text-white' : 'border border-line bg-card'}`}
    >
      <div
        className={`text-xs font-extrabold uppercase tracking-wide ${dark ? 'text-[#8fd0d8]' : 'text-teal'}`}
      >
        {label}
      </div>
      <div className="mt-2 font-display text-[26px] font-extrabold">{value}</div>
      {sub && (
        <div
          className="mt-1 text-sm font-semibold"
          style={{ color: subColor ?? (dark ? '#bcd' : 'var(--ink2)') }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

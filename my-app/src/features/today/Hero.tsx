import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Fish,
  MessageCircleQuestion,
  Ship,
} from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  confidenceLabelKey,
  getTodayAdvice,
  strongerOutOfRange,
  type Boat,
  type Coast,
  type StalenessLevel,
  type Weather,
  type Zone,
} from '@/domain'
import { formatRelativeTime } from '@/lib/format/time'
import { formatEta } from '@/lib/utils/bearing'
import { HERO_GRADIENTS } from '@/lib/utils/heroVariant'
import { tierBg, tierColor } from '@/lib/utils/tier'
import { ConfidenceBar } from '@/components/ui/ConfidenceBar'
import type { HeroKind } from './heroKind'
import { tierPillLabel } from './tierLabels'
import { MapFullView } from './MapFullView'
import { zoneWhyPoints } from './zoneWhyPoints'

interface HeroProps {
  heroKind: HeroKind
  bestZone: Zone | null
  allZones: Zone[]
  coast: Coast
  boat?: Boat
  weather: Weather
  dataStaleness: StalenessLevel
  generatedAt: string
}

const GRADIENT_MAP = {
  go: HERO_GRADIENTS.go,
  caution: HERO_GRADIENTS.caution,
  stop: HERO_GRADIENTS.stop,
  neutral: 'var(--hero-neutral)',
} as const

export function Hero({
  heroKind,
  bestZone,
  allZones,
  coast,
  boat,
  weather,
  dataStaleness,
  generatedAt,
}: HeroProps) {
  const { t } = useTranslation(['today', 'confidence', 'species', 'gear'])
  const [whyOpen, setWhyOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const whyPanelId = useId()
  const now = new Date()

  const advice = getTodayAdvice({
    heroKind,
    bestZone,
    weather,
    staleness: dataStaleness,
  })

  const showSpot = heroKind === 'normal' && bestZone?.catch
  const showWhy = heroKind === 'normal' && !!bestZone
  const outOfRangeNote =
    heroKind === 'normal' && boat && strongerOutOfRange(allZones, boat)

  const gearLabel = boat?.gear.map((g) => t(`gear:${g}`)).join(' · ') ?? ''

  const whyPoints = bestZone
    ? [
        ...zoneWhyPoints(
          bestZone,
          (r) => t(`confidence:reason_${r}`),
          (k) => t(k),
        ),
        t('whyPoint5'),
      ]
    : []

  const catchTier = bestZone?.catch?.tier ?? 'nodata'

  return (
    <section
      className="overflow-hidden rounded-[22px] text-white shadow-[0_16px_40px_-20px_rgba(13,34,54,0.5)]"
      style={{ background: GRADIENT_MAP[advice.gradient] }}
      aria-labelledby="hero-heading"
    >
      <div className="px-6 py-4 sm:px-7 sm:py-5">
        {advice.showStaleBanner && (
          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border border-white/35 bg-white/20 px-4 py-3"
            role="status"
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-[15px] font-bold leading-snug">
              {t('staleAdviceBanner', {
                age: formatRelativeTime(generatedAt, now, (k, o) => t(k, o)),
              })}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-stretch gap-4 sm:gap-5">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col">
            {boat && (
              <span
                className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 rounded-[var(--radius-pill)] bg-white/20 px-3.5 py-1.5 text-sm font-bold"
                aria-label={t('boatAdvice', { boat: boat.name })}
              >
                <Ship className="h-4 w-4 shrink-0" aria-hidden />
                <span className="font-display">{boat.name}</span>
                <span className="font-semibold opacity-90">
                  · {t('reaches', { km: boat.rangeKm })} · {gearLabel}
                </span>
              </span>
            )}

            <h1
              id="hero-heading"
              className="mt-3 font-display text-[clamp(2rem,5vw,2.875rem)] font-extrabold leading-[1.04] tracking-tight [text-shadow:0_1px_2px_rgba(13,34,54,0.35)]"
            >
              {t(advice.headlineKey)}
            </h1>

            <p className="mt-2 text-[17.5px] leading-snug opacity-95 [text-shadow:0_1px_2px_rgba(13,34,54,0.3)]">
              {t(advice.sublineKey)}
            </p>

            {outOfRangeNote && (
              <p className="mt-2 text-sm font-semibold opacity-90">{t('rangeOut')}</p>
            )}

            {heroKind === 'noBoat' && (
              <Link
                to="/settings"
                className="mt-4 inline-flex min-h-[var(--touch-primary)] items-center rounded-[13px] bg-white/20 px-5 font-bold hover:bg-white/28"
              >
                {t('noBoatAction')}
              </Link>
            )}

            {showWhy && (
              <div className="mt-3 sm:mt-auto sm:pt-2">
                <button
                  type="button"
                  onClick={() => setWhyOpen((w) => !w)}
                  className="inline-flex min-h-[var(--touch-min)] items-center gap-2 rounded-[13px] border border-white/30 bg-white/17 px-4 py-2 text-sm font-bold hover:bg-white/22 sm:px-5 sm:text-base"
                  aria-expanded={whyOpen}
                  aria-controls={whyPanelId}
                >
                  <MessageCircleQuestion className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  {t('why')}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${whyOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
              </div>
            )}
          </div>

          {showSpot && bestZone?.catch && boat && (
            <div className="flex min-w-0 flex-[0_1_400px] flex-col rounded-[18px] border border-white/26 bg-white/16 p-4">
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                  {t('best')}
                </div>
                <div className="mt-0.5 font-display text-[23px] font-bold">
                  {bestZone.name}
                </div>
                {(bestZone.species?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-2 text-[15px] font-bold">
                    <Fish className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span>
                      {bestZone.species!.map((s) => t(`species:${s}`)).join(', ')}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-[15px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    {bestZone.distanceKm} km · {bestZone.bearing}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden />~{formatEta(bestZone.etaMins)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-[var(--radius-pill)] px-3 py-1.5 text-[14px] font-extrabold ${
                      advice.mutedCatchPill
                        ? 'bg-white/22 text-white/88'
                        : 'bg-white'
                    }`}
                    style={
                      advice.mutedCatchPill
                        ? undefined
                        : {
                            color: tierColor(catchTier),
                            background: tierBg(catchTier),
                          }
                    }
                  >
                    {tierPillLabel(catchTier, (k) => t(k))}
                  </span>

                  {advice.displayConfidence && (
                    <ConfidenceBar
                      compact
                      level={advice.displayConfidence}
                      heading={t('howSure')}
                      label={t(
                        `confidence:${confidenceLabelKey(advice.displayConfidence)}`,
                      )}
                    />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="mt-4 flex min-h-[var(--touch-min)] w-full items-center justify-center gap-2 rounded-[13px] bg-white font-bold text-navy hover:bg-white/92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Compass className="h-5 w-5" aria-hidden />
                {t('showMap')}
              </button>
              <MapFullView
                open={mapOpen}
                onClose={() => setMapOpen(false)}
                coast={coast}
                zones={allZones}
                boat={boat}
                weather={weather}
              />
            </div>
          )}
        </div>

        {whyOpen && showWhy && (
          <div
            id={whyPanelId}
            className="mt-3 rounded-[15px] bg-white/13 p-4"
          >
            <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
              {whyPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-[15px] leading-snug opacity-97"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

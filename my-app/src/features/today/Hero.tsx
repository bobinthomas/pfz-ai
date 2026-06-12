import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Fish,
  Leaf,
  Navigation2,
  RefreshCw,
  ShieldAlert,
  Waves,
  Wind,
} from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  confidenceDots,
  confidenceLabelKey,
  type Forecast,
  type HeroGradient,
  type TodayAdviceView,
  type Zone,
} from '@/domain'
import { formatRelativeTime } from '@/lib/format/time'
import { bearingToDegrees, formatEta } from '@/lib/utils/bearing'
import { tierBg, tierColor } from '@/lib/utils/tier'
import { PresenceShareChips } from './PresenceShareChips'
import { tierPillLabel } from './tierLabels'
import { zoneWhyPoints } from './zoneWhyPoints'

interface HeroProps {
  advice: TodayAdviceView
  forecast: Forecast
  bestZone: Zone | null
  isFetching: boolean
  onRefresh: () => void
}

const HERO_GRADIENT: Record<HeroGradient, string> = {
  good: 'var(--hero-good)',
  ok: 'var(--hero-ok)',
  low: 'var(--hero-low)',
  stop: 'var(--hero-stop)',
  neutral: 'var(--hero-neutral)',
}

const HERO_CHIP =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/22 bg-white/16 px-2.5 text-xs font-bold leading-none backdrop-blur-sm'

function DecisionBadge({ decision, t }: { decision: string; t: (k: string) => string }) {
  if (decision === 'GO') return null

  const label =
    decision === 'CAUTION'
      ? t('decisionCaution')
      : decision === 'NO_GO'
        ? t('decisionNoGo')
        : null
  if (!label) return null

  return (
    <span className={`${HERO_CHIP} font-extrabold uppercase tracking-wide`}>
      {label}
    </span>
  )
}

export function Hero({
  advice,
  forecast,
  bestZone,
  isFetching,
  onRefresh,
}: HeroProps) {
  const { t } = useTranslation(['today', 'confidence', 'species', 'gear'])
  const [whyOpen, setWhyOpen] = useState(false)
  const whyPanelId = useId()
  const now = new Date()
  const boat = forecast.boat
  const severe = advice.screenState === 'severe'
  const gradient = HERO_GRADIENT[advice.heroGradient]

  const showBestSpot =
    advice.screenState === 'normal' &&
    advice.decision !== 'NO_GO' &&
    bestZone?.catch &&
    boat

  const showWhy = showBestSpot && !severe

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

  function handleNavigate() {
    if (!bestZone) return
    const { lat, lng } = bestZone.center
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener')
  }

  const subline =
    severe
      ? t('s_stop')
      : advice.screenState === 'empty'
        ? t('emptySub')
        : advice.screenState === 'noReachable'
          ? t('noReachableSub')
          : showBestSpot
            ? advice.strongerOutOfRange
              ? t('rangeOut')
              : t('inRange')
            : bestZone
              ? t('sub_tmpl', {
                  zone: bestZone.name,
                  km: bestZone.distanceKm,
                  bearing: bestZone.bearing,
                  eta: formatEta(bestZone.etaMins),
                  range: advice.strongerOutOfRange ? t('rangeOut') : t('inRange'),
                })
              : null

  const weatherChip =
    !severe && advice.screenState === 'normal'
      ? advice.weatherVerdict === 'safe'
        ? t('seaCalm')
        : t('seaRough')
      : null

  return (
    <section
      className="overflow-hidden rounded-[22px] text-white shadow-[0_16px_40px_-20px_rgba(13,34,54,0.5)]"
      style={{ background: gradient }}
      aria-labelledby="hero-heading"
    >
      <div className="px-5 py-3.5 sm:px-6 sm:py-4">
        {advice.staleness !== 'fresh' && advice.screenState !== 'noBoat' && (
          <div
            className="mb-3 flex items-start gap-2.5 rounded-[14px] border border-white/35 bg-white/20 px-3.5 py-2.5"
            role="status"
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="text-sm font-bold leading-snug">
              {t('staleAdviceBanner', {
                age: formatRelativeTime(
                  forecast.meta.generatedAt,
                  now,
                  (k, o) => t(k, o),
                ),
              })}
            </p>
          </div>
        )}

        <div
          className={
            showBestSpot
              ? 'flex flex-col gap-3 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-stretch min-[900px]:gap-4'
              : 'flex flex-col gap-3'
          }
        >
          <div className="flex min-w-0 flex-col min-[900px]:h-full min-[900px]:justify-center">
            {advice.screenState !== 'noBoat' && boat && (
              <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 text-xs font-extrabold uppercase tracking-wide opacity-90">
                {severe ? (
                  <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <Fish className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {severe
                  ? forecast.coast.name.split(',')[0]
                  : `${t('bestCatch')} · ${boat.name}`}
              </span>
            )}

            {advice.screenState === 'noBoat' ? (
              <>
                <h1
                  id="hero-heading"
                  className="mt-3 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-tight"
                >
                  {t('noBoatTitle')}
                </h1>
                <p className="mt-2 text-[17px] leading-snug opacity-95">{t('noBoatSub')}</p>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex min-h-[var(--touch-primary)] items-center rounded-[13px] bg-white/20 px-5 font-bold hover:bg-white/28"
                >
                  {t('noBoatAction')}
                </Link>
              </>
            ) : (
              <>
                <h1
                  id="hero-heading"
                  className="mt-1.5 font-display text-[clamp(1.65rem,3.2vw,2.15rem)] font-extrabold leading-[1.05] tracking-tight [text-shadow:0_1px_2px_rgba(13,34,54,0.35)]"
                >
                  {t(advice.catchHeadlineKey)}
                </h1>

                {subline && (
                  <p className="mt-1.5 text-[15px] leading-snug opacity-95 [text-shadow:0_1px_2px_rgba(13,34,54,0.3)] min-[900px]:line-clamp-2">
                    {subline}
                  </p>
                )}

                {advice.confidence && advice.catchConfidenceReasonKey && !severe && (
                  <div className="mt-2.5 rounded-xl border border-white/24 bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-85">
                        {t('howSure')}
                      </span>
                      <span className="font-display text-lg font-extrabold">
                        {t(`confidence:${confidenceLabelKey(advice.confidence)}`)}
                      </span>
                      <span className="flex gap-0.5" aria-hidden>
                        {[0, 1, 2].map((i) => (
                          <i
                            key={i}
                            className="h-2 w-2 rounded-full"
                            style={{
                              background:
                                i < confidenceDots(advice.confidence!)
                                  ? '#fff'
                                  : 'rgba(255,255,255,0.35)',
                            }}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug opacity-96 min-[900px]:line-clamp-2">
                      {t(advice.catchConfidenceReasonKey)}
                    </p>
                  </div>
                )}

                {(weatherChip ||
                  (advice.decision && advice.decision !== 'GO') ||
                  showWhy) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {weatherChip && (
                      <span className={HERO_CHIP}>
                        {advice.weatherVerdict === 'safe' ? (
                          <Waves className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : (
                          <Wind className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        )}
                        {weatherChip}
                      </span>
                    )}
                    {advice.decision && (
                      <DecisionBadge decision={advice.decision} t={t} />
                    )}
                    {showWhy && (
                      <button
                        type="button"
                        onClick={() => setWhyOpen((w) => !w)}
                        className={`${HERO_CHIP} hover:bg-white/22`}
                        aria-expanded={whyOpen}
                        aria-controls={whyPanelId}
                      >
                        <Leaf className="h-4 w-4 shrink-0" aria-hidden />
                        {t('why')}
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 transition-transform ${whyOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                    )}
                  </div>
                )}

              </>
            )}
          </div>

          {showBestSpot && bestZone?.catch && boat && (
            <div className="flex h-full min-w-0 flex-col rounded-[16px] border border-white/26 bg-white/16 p-3.5 backdrop-blur-sm min-[900px]:min-h-0">
              <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div className="flex items-start gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/22"
                  aria-hidden
                >
                  <Navigation2
                    className="h-6 w-6"
                    style={{ transform: `rotate(${bearingToDegrees(bestZone.bearing)}deg)` }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">
                        {t('catchHere')}
                      </div>
                      <div className="font-display text-xl font-bold leading-tight">
                        {bestZone.name}
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-extrabold ${
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
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
                    {(bestZone.species?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Fish className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                        {bestZone.species!.map((s) => t(`species:${s}`)).join(', ')}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      {bestZone.distanceKm} km · {bestZone.bearing}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />~{formatEta(bestZone.etaMins)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <PresenceShareChips zone={bestZone} showUpdated />
                {advice.worth && (
                  <div className="rounded-lg bg-white/14 px-2.5 py-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wide opacity-85">
                      {t('worthTrip')}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold leading-snug">
                      {t(`worthTripExplain_${advice.worth.verdict}`, {
                        litres: advice.worth.fuelLitres,
                        cost: advice.worth.fuelCost,
                      })}
                    </p>
                  </div>
                )}
              </div>
              </div>

              <div className="mt-auto flex shrink-0 flex-row gap-2 pt-2.5">
                {advice.primaryAction === 'refresh' ? (
                  <>
                    <button
                      type="button"
                      disabled={!advice.canRefresh || isFetching}
                      onClick={onRefresh}
                      className="flex min-h-[var(--touch-min)] flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-white text-sm font-bold text-navy hover:bg-white/92 disabled:opacity-60 min-[900px]:min-h-[48px]"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                        aria-hidden
                      />
                      {advice.canRefresh ? t('getReading') : t('connectToUpdate')}
                    </button>
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="flex min-h-[var(--touch-min)] items-center justify-center rounded-[11px] border border-white/40 bg-white/12 px-3 text-sm font-bold hover:bg-white/20 min-[900px]:min-h-[48px]"
                    >
                      {t('navigate')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="flex min-h-[var(--touch-min)] flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-white text-sm font-bold text-navy hover:bg-white/92 min-[900px]:min-h-[48px]"
                    >
                      {t('navigate')}
                    </button>
                    <button
                      type="button"
                      disabled={!advice.canRefresh || isFetching}
                      onClick={onRefresh}
                      className="flex min-h-[var(--touch-min)] items-center justify-center rounded-[11px] border border-white/40 bg-white/12 px-3 hover:bg-white/20 disabled:opacity-60 min-[900px]:min-h-[48px]"
                      aria-label={advice.canRefresh ? t('getReading') : t('connectToUpdate')}
                    >
                      <RefreshCw
                        className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`}
                        aria-hidden
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {whyOpen && showWhy && (
          <div id={whyPanelId} className="mt-3 rounded-[15px] bg-white/13 p-4">
            <h4 className="mb-3 font-display text-[15px] font-bold opacity-95">
              {t('whyFishTitle')}
            </h4>
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

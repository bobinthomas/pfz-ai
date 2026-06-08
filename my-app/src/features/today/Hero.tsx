import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Fish,
  MessageCircleQuestion,
  RefreshCw,
  Ship,
} from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  confidenceLabelKey,
  type Forecast,
  type TodayAdviceView,
  type Zone,
} from '@/domain'
import { formatRelativeTime } from '@/lib/format/time'
import { formatEta } from '@/lib/utils/bearing'
import { tierBg, tierColor } from '@/lib/utils/tier'
import { ConfidenceBar } from '@/components/ui/ConfidenceBar'
import { tierPillLabel } from './tierLabels'
import { zoneWhyPoints } from './zoneWhyPoints'

interface HeroProps {
  advice: TodayAdviceView
  forecast: Forecast
  bestZone: Zone | null
  isFetching: boolean
  onRefresh: () => void
}

const DECISION_GRADIENT = {
  GO: 'var(--hero-go)',
  CAUTION: 'var(--hero-caution)',
  NO_GO: 'var(--hero-stop)',
} as const

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

  const gradient =
    advice.decision === 'GO'
      ? DECISION_GRADIENT.GO
      : advice.decision === 'CAUTION'
        ? DECISION_GRADIENT.CAUTION
        : advice.decision === 'NO_GO' || advice.screenState === 'severe'
          ? DECISION_GRADIENT.NO_GO
          : 'var(--hero-neutral)'

  const showBestSpot =
    advice.screenState === 'normal' &&
    advice.decision !== 'NO_GO' &&
    bestZone?.catch &&
    boat

  const showWhy = showBestSpot
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

  function handleNavigate() {
    if (!bestZone) return
    const { lat, lng } = bestZone.center
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener')
  }

  const decisionLabel =
    advice.decision === 'GO'
      ? t('decisionGo')
      : advice.decision === 'CAUTION'
        ? t('decisionCaution')
        : advice.decision === 'NO_GO'
          ? t('decisionNoGo')
          : null

  return (
    <section
      className="overflow-hidden rounded-[22px] text-white shadow-[0_16px_40px_-20px_rgba(13,34,54,0.5)]"
      style={{ background: gradient }}
      aria-labelledby="hero-heading"
    >
      <div className="px-6 py-4 sm:px-7 sm:py-5">
        {advice.staleness !== 'fresh' && advice.screenState !== 'noBoat' && (
          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border border-white/35 bg-white/20 px-4 py-3"
            role="status"
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-[15px] font-bold leading-snug">
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

            {decisionLabel && (
              <div
                id="hero-heading"
                className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-extrabold uppercase leading-[1.04] tracking-tight [text-shadow:0_1px_2px_rgba(13,34,54,0.35)]"
              >
                {decisionLabel}
              </div>
            )}

            {advice.screenState === 'noBoat' && (
              <>
                <h1
                  id="hero-heading"
                  className="mt-3 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-tight"
                >
                  {t('noBoatTitle')}
                </h1>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex min-h-[var(--touch-primary)] items-center rounded-[13px] bg-white/20 px-5 font-bold hover:bg-white/28"
                >
                  {t('noBoatAction')}
                </Link>
              </>
            )}

            {advice.decisionReasonKey && advice.screenState !== 'noBoat' && (
              <p className="mt-2 text-[17.5px] leading-snug opacity-95 [text-shadow:0_1px_2px_rgba(13,34,54,0.3)]">
                {t(advice.decisionReasonKey)}
              </p>
            )}

            {advice.strongerOutOfRange && (
              <p className="mt-2 text-sm font-semibold opacity-90">{t('rangeOut')}</p>
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

          {showBestSpot && bestZone?.catch && boat && (
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

                  {advice.confidence && (
                    <ConfidenceBar
                      compact
                      level={advice.confidence}
                      heading={t('howSure')}
                      label={t(
                        `confidence:${confidenceLabelKey(advice.confidence)}`,
                      )}
                    />
                  )}
                </div>

                {advice.worth && (
                  <div className="mt-3 rounded-xl bg-white/14 px-3 py-2.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide opacity-85">
                      {t('worthTrip')}
                    </div>
                    <div className="mt-0.5 text-[15px] font-bold">
                      {t(`worth_${advice.worth.verdict}`)} · ≈{' '}
                      {advice.worth.fuelLitres} L · ≈ ₹{advice.worth.fuelCost}{' '}
                      {t('worthRoundTrip')}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {advice.primaryAction === 'refresh' ? (
                  <>
                    <button
                      type="button"
                      disabled={!advice.canRefresh || isFetching}
                      onClick={onRefresh}
                      className="flex min-h-[var(--touch-primary)] flex-1 items-center justify-center gap-2 rounded-[13px] bg-white font-bold text-navy hover:bg-white/92 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`}
                        aria-hidden
                      />
                      {advice.canRefresh ? t('getReading') : t('connectToUpdate')}
                    </button>
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-[13px] border border-white/40 bg-white/12 px-4 font-bold hover:bg-white/20"
                    >
                      {t('navigate')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleNavigate}
                      className="flex min-h-[var(--touch-primary)] flex-1 items-center justify-center gap-2 rounded-[13px] bg-white font-bold text-navy hover:bg-white/92"
                    >
                      {t('navigate')}
                    </button>
                    <button
                      type="button"
                      disabled={!advice.canRefresh || isFetching}
                      onClick={onRefresh}
                      className="flex min-h-[var(--touch-min)] items-center justify-center rounded-[13px] border border-white/40 bg-white/12 px-4 hover:bg-white/20 disabled:opacity-60"
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

import { Bookmark, Calendar, MapPin, Ship, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/layout/PageShell'
import { useTrips } from '@/lib/api/tripsQueries'
import type { TripOutcome } from '@/lib/api/trips'
import { useBoatStore } from '@/lib/boat/boatStore'
import { formatDay } from '@/lib/format/time'
import { useSavedSpots, useRemoveSavedSpot } from '@/lib/trips/useSavedSpots'
import { tierColor, tierBg } from '@/lib/utils/tier'
import { tierPillLabel } from '@/features/today/tierLabels'

function outcomeColor(outcome: TripOutcome): string {
  if (outcome === 'good_catch') return 'var(--go)'
  if (outcome === 'some_catch') return 'var(--ok)'
  if (outcome === 'poor_catch') return 'var(--low)'
  return 'var(--ink2)'
}

export function TripsScreen() {
  const { t, i18n } = useTranslation(['trips', 'today'])
  const formatTripDay = (iso: string) =>
    formatDay(iso, new Date(), i18n.language, (k, o) => t(`today:${k}`, o))
  const boatId = useBoatStore((s) => s.boatId)
  const { data: tripsData, isPending: tripsLoading } = useTrips(boatId)
  const { data: saved = [], isPending: savedLoading } = useSavedSpots()
  const removeSaved = useRemoveSavedSpot()

  return (
    <PageShell active="trips">
      <main id="main-content">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t('trips:title')}</h1>
        <p className="mt-1 text-ink2">{t('trips:subtitle')}</p>

        <section className="mt-8" aria-labelledby="saved-spots-heading">
          <div className="mb-3 flex items-center gap-2.5">
            <Bookmark className="h-5 w-5 text-ink2" aria-hidden />
            <h2 id="saved-spots-heading" className="font-display text-lg font-bold text-ink">
              {t('trips:savedSpots')}
            </h2>
          </div>

          {savedLoading ? (
            <div className="h-24 animate-pulse rounded-[20px] bg-soft" />
          ) : saved.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-line2 bg-soft/60 px-5 py-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-ink2" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-ink2">{t('trips:emptySaved')}</p>
              <p className="mt-1 text-sm text-ink2">{t('trips:emptySavedHint')}</p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-[20px] border-[1.5px] border-line bg-card">
              {saved.map((spot, idx) => (
                <li
                  key={spot.id}
                  className={`flex items-center gap-3 px-4 py-4 ${
                    idx < saved.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-teal">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold text-ink">
                      {spot.zoneName}
                    </div>
                    <div className="text-xs font-semibold text-ink2">
                      {spot.zoneId} · {t('trips:savedAt', {
                        date: formatTripDay(spot.createdAt),
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeSaved(spot.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-soft text-ink2 hover:bg-soft2"
                    aria-label={t('trips:removeSaved', { name: spot.zoneName })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8" aria-labelledby="past-trips-heading">
          <div className="mb-3 flex items-center gap-2.5">
            <Ship className="h-5 w-5 text-ink2" aria-hidden />
            <h2 id="past-trips-heading" className="font-display text-lg font-bold text-ink">
              {t('trips:pastTrips')}
            </h2>
          </div>

          {tripsLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-[20px] bg-soft" />
              ))}
            </div>
          ) : !tripsData?.trips.length ? (
            <div className="rounded-[20px] border border-line bg-card px-5 py-8 text-center text-ink2">
              {t('trips:emptyTrips')}
            </div>
          ) : (
            <ul className="overflow-hidden rounded-[20px] border-[1.5px] border-line bg-card">
              {tripsData.trips.map((trip, idx) => {
                const tier = trip.catchTier
                return (
                  <li
                    key={trip.id}
                    className={`px-4 py-4 ${idx < tripsData.trips.length - 1 ? 'border-b border-line' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-ink2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base font-bold text-ink">
                            {trip.zoneName}
                          </span>
                          <span
                            className="rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-extrabold"
                            style={{
                              color: tierColor(tier),
                              background: tierBg(tier),
                            }}
                          >
                            {tierPillLabel(tier, (k) => t(`today:${k}`))}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-ink2">
                          {formatTripDay(trip.date)} · {trip.coastName} · {trip.distanceKm} km
                        </div>
                        <div
                          className="mt-1.5 text-sm font-bold"
                          style={{ color: outcomeColor(trip.outcome) }}
                        >
                          {t(`trips:outcome_${trip.outcome}`)}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </PageShell>
  )
}

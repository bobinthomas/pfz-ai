import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { isSafetyBlocked } from '@/domain'
import { getStalenessFromMeta } from '@/domain/staleness'
import type { Zone } from '@/domain/types'
import { useAppForecast } from '@/lib/api/useAppForecast'
import { useConnectivityStore } from '@/lib/offline/connectivity'
import { useSafetyStore } from '@/lib/offline/safetyStore'
import { zoneLetter } from '@/lib/utils/zoneLetters'
import { CoastDateSelectors } from '@/features/today/CoastDateSelectors'
import { CourseMap } from '@/features/today/CourseMap'
import { ErrorCard } from '@/features/today/ErrorCard'
import { requireBoat } from '@/features/today/heroKind'
import { ZonesRail } from '@/features/today/ZonesRail'
import { useTranslation } from 'react-i18next'

const ZoneDetailDrawer = lazy(() =>
  import('@/features/today/ZoneDetailDrawer').then((m) => ({
    default: m.ZoneDetailDrawer,
  })),
)

export function ZonesScreen() {
  const { t } = useTranslation(['zones', 'today'])
  const setLastSyncedAt = useConnectivityStore((s) => s.setLastSyncedAt)
  const setSevereWarning = useSafetyStore((s) => s.setSevereWarning)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  const { data, isPending, isFetching, refetch } = useAppForecast()

  useEffect(() => {
    if (data && !isFetching) setLastSyncedAt(new Date())
  }, [data, isFetching, setLastSyncedAt])

  useEffect(() => {
    setSevereWarning(data ? isSafetyBlocked(data.weather) : false)
    return () => setSevereWarning(false)
  }, [data, setSevereWarning])

  if (isPending && !data) {
    return (
      <PageShell active="zones">
        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-soft" />
          <div className="h-12 rounded-[20px] bg-soft" />
          <div className="h-64 rounded-[20px] bg-soft" />
          <div className="h-48 rounded-[20px] bg-soft" />
        </div>
      </PageShell>
    )
  }

  if (!data) {
    return (
      <PageShell active="zones">
        <main id="main-content" className="mt-6">
          <ErrorCard onRetry={() => void refetch()} />
        </main>
      </PageShell>
    )
  }

  const boat = data.boat
  const severe = isSafetyBlocked(data.weather)
  const dataStaleness = getStalenessFromMeta(data.meta, new Date())

  return (
    <PageShell active="zones">
      <CoastDateSelectors />
      <main id="main-content" className="mt-4">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t('zones:title')}</h1>
        <p className="mt-1 text-ink2">{t('zones:subtitle')}</p>

        {!boat ? (
          <div className="mt-8 rounded-[20px] border border-line bg-card p-6 text-center">
            <p className="text-ink2">{t('today:noBoatSub')}</p>
            <Link
              to="/settings"
              className="mt-4 inline-flex min-h-[var(--touch-primary)] items-center rounded-[15px] bg-navy px-6 font-bold text-white"
            >
              {t('today:noBoatAction')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <section aria-labelledby="zones-map-heading">
              <h2 id="zones-map-heading" className="sr-only">
                {t('zones:mapHeading')}
              </h2>
              <CourseMap
                coast={data.coast}
                zones={data.zones}
                boat={requireBoat(boat)}
                weather={data.weather}
                dataStaleness={dataStaleness}
                size="full"
              />
              <p className="mt-2 px-1 text-sm text-ink2">{t('today:mapFullHint')}</p>
            </section>

            <ZonesRail
              zones={data.zones}
              boat={boat}
              disabled={severe}
              dataStaleness={dataStaleness}
              onSelect={(z) => {
                if (z.dataStatus === 'ok' && !severe) setSelectedZone(z)
              }}
            />
          </div>
        )}
      </main>

      {boat && (
        <Suspense fallback={null}>
          <ZoneDetailDrawer
            zone={selectedZone}
            letter={
              selectedZone
                ? zoneLetter(selectedZone.id, data.zones, boat)
                : '?'
            }
            boat={boat}
            weather={data.weather}
            dataStaleness={dataStaleness}
            onClose={() => setSelectedZone(null)}
          />
        </Suspense>
      )}
    </PageShell>
  )
}

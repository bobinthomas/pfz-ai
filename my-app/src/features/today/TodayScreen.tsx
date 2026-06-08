import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { LanguageGate } from '@/components/ui/LanguageGate'
import { NativeReviewBanner } from '@/components/ui/NativeReviewBanner'
import { AssistantFab } from '@/features/assistant/AssistantFab'
import { bestReachable, getTodayAdvice, isSafetyBlocked } from '@/domain'
import { useAppForecast } from '@/lib/api/useAppForecast'
import { useConnectivityStore } from '@/lib/offline/connectivity'
import { useSafetyStore } from '@/lib/offline/safetyStore'
import { useLanguageStore } from '@/lib/i18n/languageStore'
import { zoneLetter } from '@/lib/utils/zoneLetters'
import type { Zone } from '@/domain/types'
import { BestSpotSection } from './BestSpotSection'
import { CoastDateSelectors } from './CoastDateSelectors'
import { ErrorCard } from './ErrorCard'
import { Hero } from './Hero'
import { requireBoat } from './heroKind'
import { TodaySkeleton } from './TodaySkeleton'
import { TrustStrip } from './TrustStrip'
import { WeatherCard } from './WeatherCard'
import { ZonesRail } from './ZonesRail'

const AssistantDrawer = lazy(() =>
  import('@/features/assistant/AssistantDrawer').then((m) => ({
    default: m.AssistantDrawer,
  })),
)
const ZoneDetailDrawer = lazy(() =>
  import('./ZoneDetailDrawer').then((m) => ({ default: m.ZoneDetailDrawer })),
)

export function TodayScreen() {
  const language = useLanguageStore((s) => s.language)
  const online = useConnectivityStore((s) => s.online)
  const setLastSyncedAt = useConnectivityStore((s) => s.setLastSyncedAt)
  const setSevereWarning = useSafetyStore((s) => s.setSevereWarning)

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [askOpen, setAskOpen] = useState(false)

  const { data, isPending, isFetching, refetch } = useAppForecast()

  useEffect(() => {
    if (data && !isFetching) setLastSyncedAt(new Date())
  }, [data, isFetching, setLastSyncedAt])

  useEffect(() => {
    setSevereWarning(data ? isSafetyBlocked(data.weather) : false)
    return () => setSevereWarning(false)
  }, [data, setSevereWarning])

  if (!language) {
    return <LanguageGate />
  }

  const shell = (content: ReactNode) => (
    <div className="min-h-svh bg-bg pb-28">
      <div className="relative z-[1] mx-auto max-w-[var(--max-width)] px-4 pb-[70px] pt-4 sm:px-6">
        <NavBar active="today" />
        {content}
      </div>
    </div>
  )

  if (isPending && !data) {
    return shell(<TodaySkeleton />)
  }

  if (!data) {
    return shell(<ErrorCard onRetry={() => void refetch()} />)
  }

  const boat = data.boat
  const best = boat ? bestReachable(data.zones, boat) : null
  const severe = isSafetyBlocked(data.weather)
  const advice = getTodayAdvice(data, new Date(), { online })
  const canShowMap = boat && advice.screenState !== 'noBoat'

  return (
    <div className="min-h-svh bg-bg pb-28">
      <div className="relative z-[1] mx-auto max-w-[var(--max-width)] px-4 pb-[70px] pt-4 sm:px-6">
        <NavBar active="today" />
        <CoastDateSelectors />
        <NativeReviewBanner />

        <main id="main-content">
          <Hero
            advice={advice}
            forecast={data}
            bestZone={best}
            isFetching={isFetching}
            onRefresh={() => void refetch()}
          />

          {advice.screenState !== 'noBoat' && (
            <div className="mt-4 grid items-start gap-4 min-[980px]:grid-cols-2 min-[980px]:gap-5">
              <div className="flex min-w-0 flex-col gap-4">
                {canShowMap && (
                  <BestSpotSection
                    coast={data.coast}
                    zones={data.zones}
                    boat={requireBoat(boat)}
                    weather={data.weather}
                    dataStaleness={advice.staleness}
                  />
                )}
                <WeatherCard
                  weather={data.weather}
                  meta={data.meta}
                  weatherVerdict={advice.weatherVerdict}
                  dataStaleness={advice.staleness}
                  isOffline={!online}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                {boat && (
                  <ZonesRail
                    zones={data.zones}
                    boat={boat}
                    config={data.config}
                    bestZoneId={best?.id}
                    disabled={severe}
                    dataStaleness={advice.staleness}
                    onSelect={(z) => {
                      if (z.dataStatus === 'ok' && !severe) setSelectedZone(z)
                    }}
                  />
                )}
                {best && (
                  <TrustStrip
                    accuracy={data.accuracy}
                    bestZoneName={best.name}
                    bestTier={best.catch?.tier}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <AssistantFab onClick={() => setAskOpen(true)} />
      <Suspense fallback={null}>
        <AssistantDrawer
          open={askOpen}
          onClose={() => setAskOpen(false)}
          forecast={data}
        />
        {boat && (
          <ZoneDetailDrawer
            zone={selectedZone}
            letter={
              selectedZone
                ? zoneLetter(selectedZone.id, data.zones, boat)
                : '?'
            }
            boat={boat}
            weather={data.weather}
            config={data.config}
            dataStaleness={advice.staleness}
            onClose={() => setSelectedZone(null)}
          />
        )}
      </Suspense>
    </div>
  )
}

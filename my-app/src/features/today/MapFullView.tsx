import * as Dialog from '@radix-ui/react-dialog'
import { Compass, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { bestReachable, type Boat, type Coast, type Zone } from '@/domain'
import { isSafetyBlocked } from '@/domain/safety'
import type { Weather } from '@/domain/types'
import { formatEta } from '@/lib/utils/bearing'
import { CourseMap } from './CourseMap'

interface MapFullViewProps {
  open: boolean
  onClose: () => void
  coast: Coast
  zones: Zone[]
  boat: Boat
  weather: Weather
}

export function MapFullView({
  open,
  onClose,
  coast,
  zones,
  boat,
  weather,
}: MapFullViewProps) {
  const { t } = useTranslation(['today', 'common'])
  const prevFocus = useRef<HTMLElement | null>(null)
  const blocked = isSafetyBlocked(weather)
  const best = bestReachable(zones, boat)

  useEffect(() => {
    if (open) prevFocus.current = document.activeElement as HTMLElement | null
  }, [open])

  function handleNavigate() {
    if (!best) return
    const { lat, lng } = best.center
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener')
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[55] bg-[rgba(10,24,40,0.55)]" />
        <Dialog.Content
          className="fixed inset-0 z-[56] flex flex-col bg-bg outline-none focus:outline-none min-[980px]:inset-6 min-[980px]:mx-auto min-[980px]:max-w-[920px] min-[980px]:rounded-[24px] min-[980px]:border min-[980px]:border-line min-[980px]:shadow-2xl"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            prevFocus.current?.focus()
          }}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-line bg-card px-4 py-4 sm:px-5">
            <Dialog.Title className="min-w-0 flex-1 font-display text-lg font-bold text-ink sm:text-xl">
              {best ? (
                <>
                  {best.name}
                  <span className="mt-0.5 block text-sm font-semibold text-ink2">
                    {best.distanceKm} km {best.bearing} · ~{formatEta(best.etaMins)}
                  </span>
                </>
              ) : (
                t('best')
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl border border-line bg-soft text-ink hover:bg-soft2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                aria-label={t('common:close')}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
            <CourseMap
              coast={coast}
              zones={zones}
              boat={boat}
              weather={weather}
              size="full"
            />
          </div>

          {!blocked && best && (
            <div className="shrink-0 border-t border-line bg-card p-4 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={handleNavigate}
                className="flex min-h-[var(--touch-primary)] w-full items-center justify-center gap-2.5 rounded-[15px] bg-navy font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <Compass className="h-5 w-5" aria-hidden />
                {t('navigate')}
              </button>
              <p className="mt-3 text-center text-sm leading-relaxed text-ink2">
                {t('mapFullHint')}
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

import { ChevronRight, Ship } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/layout/PageShell'
import { useAppForecast } from '@/lib/api/useAppForecast'
import { BoatPickerDrawer } from './BoatPickerDrawer'
import { DevPreview } from './DevPreview'
import { LanguageSection } from './LanguageSection'

export function SettingsScreen() {
  const { t } = useTranslation(['settings', 'gear', 'today'])
  const [boatPickerOpen, setBoatPickerOpen] = useState(false)
  const { data, isLoading } = useAppForecast()

  return (
    <PageShell active="settings">
      <main id="main-content">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {t('settings:title')}
        </h1>
        <p className="mt-2 text-ink2">{t('settings:subtitle')}</p>

        <section className="mt-8" aria-labelledby="boat-settings-heading">
          <h2
            id="boat-settings-heading"
            className="mb-3 font-display text-lg font-bold text-ink"
          >
            {t('settings:yourBoat')}
          </h2>
          {isLoading || !data ? (
            <div className="rounded-[20px] border border-line bg-card p-5 text-ink2">
              {t('settings:loading')}
            </div>
          ) : !data.boat ? (
            <div className="rounded-[20px] border border-line bg-card p-5">
              <p className="text-ink2">{t('today:noBoatSub')}</p>
              <button
                type="button"
                onClick={() => setBoatPickerOpen(true)}
                className="mt-4 min-h-[var(--touch-primary)] rounded-[15px] bg-navy px-6 font-bold text-white"
              >
                {t('settings:changeBoat')}
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[20px] border-[1.5px] border-line bg-card">
              <div className="flex items-center gap-4 border-b border-line px-5 py-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-soft text-teal">
                  <Ship className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-bold text-ink">
                    {data.boat.name}
                  </div>
                  <div className="text-sm text-ink2">
                    {t('today:reaches', { km: data.boat.rangeKm })} ·{' '}
                    {data.boat.gear.map((g) => t(`gear:${g}`)).join(' · ')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex min-h-[var(--touch-primary)] w-full items-center justify-between px-5 text-left font-bold text-ink hover:bg-soft"
                onClick={() => setBoatPickerOpen(true)}
              >
                <span>{t('settings:changeBoat')}</span>
                <ChevronRight className="h-5 w-5 text-ink2" />
              </button>
              <p className="border-t border-line px-5 py-3 text-sm text-ink2">
                {t('settings:changeBoatHint')}
              </p>
            </div>
          )}
        </section>

        <LanguageSection />
        <DevPreview />
      </main>

      <BoatPickerDrawer
        open={boatPickerOpen}
        onClose={() => setBoatPickerOpen(false)}
      />
    </PageShell>
  )
}

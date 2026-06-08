import { Check } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import type { Accuracy } from '@/domain/types'
import { tierPillLabel } from './tierLabels'

interface TrustStripProps {
  accuracy: Accuracy
  bestZoneName: string
  bestTier?: string
}

export function TrustStrip({ accuracy, bestZoneName, bestTier = 'good' }: TrustStripProps) {
  const { t } = useTranslation('today')

  return (
    <section aria-labelledby="trust-heading">
      <div className="mb-2.5 flex items-center gap-2.5 px-1">
        <Check className="h-[19px] w-[19px] text-ink2" aria-hidden />
        <h2 id="trust-heading" className="font-display text-[19px] font-bold text-ink">
          {t('track')}
        </h2>
      </div>
      <div className="rounded-[20px] border-[1.5px] border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold">
          {t('trustRight')}{' '}
          <span className="font-display text-lg font-extrabold text-good">
            {accuracy.correct} {t('trustOfDays', { days: accuracy.windowDays })}
          </span>
        </div>
        <div
          className="my-3.5 flex gap-1.5"
          role="img"
          aria-label={`${accuracy.correct} correct of ${accuracy.windowDays}`}
        >
          {accuracy.history.map((hit, i) => (
            <i
              key={i}
              className="h-2.5 flex-1 rounded-[5px]"
              style={{ background: hit ? 'var(--good)' : 'var(--stop)' }}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-sm font-medium leading-relaxed text-ink2">
          <Trans
            i18nKey="trustNote"
            values={{
              zone: bestZoneName,
              tier: tierPillLabel(bestTier, (k) => t(k)),
            }}
            components={{ 1: <strong className="text-ink" /> }}
          />
        </p>
      </div>
    </section>
  )
}

import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '@/lib/i18n/languageStore'

export function NativeReviewBanner() {
  const { t } = useTranslation('today')
  const language = useLanguageStore((s) => s.language)

  if (language !== 'ta' && language !== 'ml') return null

  return (
    <p
      className="mb-4 rounded-xl border border-caution/30 bg-low-bg px-4 py-3 text-sm font-semibold leading-relaxed text-ink"
      role="note"
    >
      {t('nativeReview')}
    </p>
  )
}

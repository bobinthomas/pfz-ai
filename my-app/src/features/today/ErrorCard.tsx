import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ErrorCardProps {
  onRetry: () => void
}

export function ErrorCard({ onRetry }: ErrorCardProps) {
  const { t } = useTranslation('today')

  return (
    <div
      className="rounded-[20px] border-[1.5px] border-line bg-card px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="mx-auto h-10 w-10 text-caution" />
      <h2 className="mt-4 font-display text-xl font-bold text-ink">
        {t('errorTitle')}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-ink2">{t('errorBody')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 min-h-[var(--touch-primary)] rounded-[15px] bg-navy px-8 font-bold text-white hover:brightness-110"
      >
        {t('common:tryAgain')}
      </button>
    </div>
  )
}

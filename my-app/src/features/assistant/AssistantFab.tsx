import { MessageCircleQuestion } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AssistantFabProps {
  onClick: () => void
}

export function AssistantFab({ onClick }: AssistantFabProps) {
  const { t } = useTranslation(['today', 'assistant'])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('assistant:title')}
      className="fixed bottom-[22px] right-[22px] z-40 flex h-[62px] items-center gap-2.5 rounded-[var(--radius-pill)] bg-navy px-6 font-bold text-white shadow-[0_16px_32px_-12px_rgba(13,34,54,0.6)] hover:brightness-110"
    >
      <MessageCircleQuestion className="h-5 w-5" />
      {t('ask')}
    </button>
  )
}

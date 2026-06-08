import { useTranslation } from 'react-i18next'

export function SkipLink() {
  const { t } = useTranslation('common')

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-navy focus:px-4 focus:py-3 focus:font-bold focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-teal"
    >
      {t('skipToMain')}
    </a>
  )
}

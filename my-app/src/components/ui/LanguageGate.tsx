import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, useLanguageStore } from '@/lib/i18n/languageStore'

export function LanguageGate() {
  const { t } = useTranslation('gate')
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-center bg-gradient-to-br from-teal to-[#0a4d55] p-8 text-white">
      <div className="mx-auto w-full max-w-[540px]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[17px] bg-white/18">
          <Globe className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">PFZ Kerala</h1>
        <p className="mt-2 text-base opacity-85">{t('tagline')}</p>
        <p className="mt-5 font-display text-base font-bold opacity-90">
          {t('pickAll')}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className="flex min-h-[var(--touch-primary)] flex-col gap-1 rounded-[18px] border border-white/22 bg-white/10 px-5 py-5 text-left text-white hover:bg-white/16"
            >
              <span className="font-display text-2xl font-bold">{lang.native}</span>
              <span className="text-sm font-medium opacity-70">{lang.en}</span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed opacity-70">{t('caveat')}</p>
      </div>
    </div>
  )
}

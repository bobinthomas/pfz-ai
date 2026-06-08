import { Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, useLanguageStore } from '@/lib/i18n/languageStore'

export function LanguageSection() {
  const { t } = useTranslation('settings')
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  return (
    <section className="mt-8" aria-labelledby="language-settings-heading">
      <div className="mb-3 flex items-center gap-2.5">
        <Globe className="h-5 w-5 text-ink2" aria-hidden />
        <h2 id="language-settings-heading" className="font-display text-lg font-bold text-ink">
          {t('language')}
        </h2>
      </div>
      <ul
        className="overflow-hidden rounded-[20px] border-[1.5px] border-line bg-card"
        role="listbox"
        aria-label={t('language')}
      >
        {LANGUAGES.map((lang, idx) => {
          const selected = language === lang.id
          return (
            <li key={lang.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setLanguage(lang.id)}
                className={`flex min-h-[var(--touch-primary)] w-full items-center justify-between px-5 text-left font-bold ${
                  idx < LANGUAGES.length - 1 ? 'border-b border-line' : ''
                } ${selected ? 'text-teal' : 'text-ink hover:bg-soft'}`}
              >
                <span>{lang.native}</span>
                {selected && <Check className="h-5 w-5" aria-hidden />}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 px-1 text-sm text-ink2">{t('languageHint')}</p>
    </section>
  )
}

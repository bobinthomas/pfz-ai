import { Check, Globe } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, useLanguageStore, type AppLanguage } from '@/lib/i18n/languageStore'

interface LanguageMenuProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function LanguageMenu({ open, onToggle, onClose }: LanguageMenuProps) {
  const { t } = useTranslation('common')
  const language = useLanguageStore((s) => s.language)
  const setLanguage = useLanguageStore((s) => s.setLanguage)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-line bg-soft text-ink hover:bg-soft2"
        aria-label={t('language')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div
          className="absolute right-0 top-[58px] z-45 min-w-[210px] rounded-2xl border border-line2 bg-card p-2 shadow-[0_20px_44px_-14px_rgba(13,34,54,0.25)]"
          role="listbox"
          aria-label={t('language')}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              role="option"
              aria-selected={language === lang.id}
              onClick={() => {
                setLanguage(lang.id as AppLanguage)
                onClose()
              }}
              className={`flex min-h-[52px] w-full items-center justify-between rounded-xl px-3.5 py-3 text-base font-semibold hover:bg-soft ${
                language === lang.id ? 'text-teal' : 'text-ink'
              }`}
            >
              {lang.native}
              {language === lang.id && <Check className="h-[18px] w-[18px]" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

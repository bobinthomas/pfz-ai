import { create } from 'zustand'
import i18n from './config'

export type AppLanguage = 'en' | 'ta' | 'ml'

const STORAGE_KEY = 'pfz-language'

function readStored(): AppLanguage | null {
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'en' || v === 'ta' || v === 'ml') return v
  return null
}

interface LanguageState {
  language: AppLanguage | null
  setLanguage: (lang: AppLanguage) => void
  clearLanguage: () => void
}

const initialLang = readStored()
if (initialLang) document.documentElement.lang = initialLang

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLang,
  setLanguage: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang)
    void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.classList.remove('lang-ta', 'lang-ml')
    if (lang === 'ta') document.documentElement.classList.add('lang-ta')
    if (lang === 'ml') document.documentElement.classList.add('lang-ml')
    set({ language: lang })
  },
  clearLanguage: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ language: null })
  },
}))

export const LANGUAGES = [
  { id: 'en' as const, native: 'English', en: 'English' },
  { id: 'ta' as const, native: 'தமிழ்', en: 'Tamil' },
  { id: 'ml' as const, native: 'മലയാളം', en: 'Malayalam' },
]

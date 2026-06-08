import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ta from './locales/ta.json'
import ml from './locales/ml.json'

const stored =
  typeof localStorage !== 'undefined' ? localStorage.getItem('pfz-language') : null

void i18n.use(initReactI18next).init({
  resources: { en, ta, ml },
  lng: stored === 'ta' || stored === 'ml' ? stored : 'en',
  fallbackLng: 'en',
  defaultNS: 'today',
  ns: ['common', 'today', 'gate', 'assistant', 'confidence', 'species', 'gear', 'settings', 'zones', 'trips'],
  interpolation: { escapeValue: false },
})

export default i18n

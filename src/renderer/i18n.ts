import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ko from './locales/ko.json'
import zh from './locales/zh.json'
import ja from './locales/ja.json'

// Supported languages
export const supportedLanguages = ['en', 'ko', 'zh', 'ja'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

// Get browser/system language and fallback to 'en' if not supported
function getDefaultLanguage(): SupportedLanguage {
  // Try to get from localStorage first
  const saved = localStorage.getItem('language')
  if (saved && supportedLanguages.includes(saved as SupportedLanguage)) {
    return saved as SupportedLanguage
  }

  // Detect system language
  const systemLang = navigator.language.split('-')[0] // 'ko-KR' -> 'ko'
  if (supportedLanguages.includes(systemLang as SupportedLanguage)) {
    return systemLang as SupportedLanguage
  }

  // Default to English
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    zh: { translation: zh },
    ja: { translation: ja }
  },
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already escapes
  }
})

export default i18n

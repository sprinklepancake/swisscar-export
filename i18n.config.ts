export default {
  legacy: false,
  locale: 'en',
  availableLocales: ['en', 'fr', 'de', 'ro', 'sr', 'ar', 'bg', 'uk', 'el', 'ru'],
  messages: {
    en: () => import('./i18n/locales/en.json'),
    fr: () => import('./i18n/locales/fr.json'),
    de: () => import('./i18n/locales/de.json'),
    ar: () => import('./i18n/locales/ar.json'),
    uk: () => import('./i18n/locales/uk.json'),
    bg: () => import('./i18n/locales/bg.json'),
    el: () => import('./i18n/locales/el.json'),
    ro: () => import('./i18n/locales/ro.json'),
    ru: () => import('./i18n/locales/ru.json'),
    sr: () => import('./i18n/locales/sr.json')
  }
}
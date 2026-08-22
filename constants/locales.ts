// constants/locales.ts
// Single source of truth for the locale codes used by @nuxtjs/i18n.
// nuxt.config.ts imports this so route rules can never drift out of sync with
// the locale list again (that drift is what left /de/admin server-rendered
// while only /en/admin and /ar/admin were client-rendered).

export const LOCALE_CODES = [
  'en', 'fr', 'de', 'ro', 'sr', 'ar', 'bg',
  'uk', 'el', 'ru', 'pl', 'sq', 'es', 'it',
] as const

export type LocaleCode = (typeof LOCALE_CODES)[number]

export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * The i18n strategy is 'prefix', which means EVERY route is locale-prefixed
 * (/en/login, /de/login …) and an unprefixed path like /login is a hard 404.
 *
 * Inside components use localePath() from @nuxtjs/i18n. This helper exists for
 * the places where localePath() is awkward or unavailable — route middleware,
 * plain callbacks — where all we have is the current path.
 */
export const withLocalePrefix = (currentPath: string, targetPath: string): string => {
  const match = currentPath.match(/^\/([a-z]{2})(?=\/|$)/)
  const code = match?.[1]
  const prefix = code && (LOCALE_CODES as readonly string[]).includes(code) ? code : DEFAULT_LOCALE
  const clean = targetPath.startsWith('/') ? targetPath : `/${targetPath}`
  return `/${prefix}${clean === '/' ? '' : clean}` || `/${prefix}`
}

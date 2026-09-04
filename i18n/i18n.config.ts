// i18n/i18n.config.ts
//
// LOCATION MATTERS. @nuxtjs/i18n v9+ resolves `vueI18n` in nuxt.config.ts
// relative to `restructureDir`, which defaults to <rootDir>/i18n — the same
// reason `langDir: 'locales'` finds i18n/locales. This file used to sit at the
// repo root, so the module resolved it to i18n/i18n.config.ts, found nothing,
// and generated `const vueI18nConfigs = []`. Every option below was silently
// inert, including the fallback: a key missing from de.json rendered as the raw
// string "register.no_id_needed_title" on the page instead of the English text.
// Moving the file is the whole fix. Do not move it back to the root.
export default {
  legacy: false,
  locale: 'en',
  // Renders the English text when a key has not been translated yet, instead of
  // the bare key name. The module loads en.json alongside the active locale to
  // make this work, so it costs one extra (cached) message file per request.
  fallbackLocale: 'en',
  // These warnings are noisy in the browser console and mean nothing to users.
  missingWarn: false,
  fallbackWarn: false,
  // NOTE: there is deliberately no `messages` key here. The module already
  // builds a loader per locale from nuxt.config's `locales[].file` + `langDir`
  // (see `localeLoaders` in the generated build). Declaring `messages` as a map
  // of import functions here overwrites that with raw functions, which vue-i18n
  // cannot read as a message tree.
}

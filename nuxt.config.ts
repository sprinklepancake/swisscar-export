// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-09-24',
  runtimeConfig: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    
    // Private config (server-side only)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    compatibilityDate: '2025-08-05',
    preset: 'node-server',
    storage: {
      db: {
        driver: 'fs',
        base: '/opt/render/project/src/.data' // Render uses .data directory
      }
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],
  css: ['@/assets/css/main.css'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'fr', iso: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'ro', iso: 'ro-RO', file: 'ro.json', name: 'Român' },
      { code: 'sr', iso: 'sr-RS', file: 'sr.json', name: 'Srpski' },
      { code: 'ar', iso: 'ar-AR', file: 'ar.json', name: 'Arabic' },
      { code: 'bg', iso: 'bg-BG', file: 'bg.json', name: 'Bulgarian' },
      { code: 'uk', iso: 'uk-UA', file: 'uk.json', name: 'Ukrainian' },
      { code: 'el', iso: 'el-GR', file: 'el.json', name: 'Greek' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Russian' }
    ],
    types: 'composition',
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en'
    },
    vueI18n: './i18n.config.ts'
  },
  routeRules: {
    '/api/**': { cors: true },
    '/en/api/**': { cors: true },
    '/ar/api/**': { cors: true },
    '/el/api/**': { cors: true },
    '/fr/api/**': { cors: true },
    '/de/api/**': { cors: true },
    '/ro/api/**': { cors: true },
    '/sr/api/**': { cors: true },
    '/bg/api/**': { cors: true },
    '/uk/api/**': { cors: true },
    '/ru/api/**': { cors: true },
    // Add all your locales
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/admin': { ssr: false }, // Disable SSR for admin panel
    '/en/admin': { ssr: false },
    '/ar/admin': { ssr: false },
    '/el/admin': { ssr: false },
    // Add for all locales
  },
  build: {
    transpile: [
      '@headlessui/vue',
      '@heroicons/vue'
    ]
  },
  vite: {
    optimizeDeps: {
      include: ['@headlessui/vue']
    }
  },
  devtools: {
    enabled: true
  },
  typescript: {
    strict: false,
    typeCheck: false,
    shim: false
  }
})
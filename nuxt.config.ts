// nuxt.config.ts
import { LOCALE_CODES } from './constants/locales'

// The i18n strategy is 'prefix', so every page lives under /<locale>/…
// Route rules therefore have to be generated for every locale — hardcoding a
// handful of them is what left /de/admin, /fr/admin, /it/admin … server-rendered
// while only /en/admin and /ar/admin were client-rendered, which is why the
// admin panel "didn't open in some browsers" (really: in some languages).
const localeRouteRules = (path: string, rule: Record<string, any>) =>
  Object.fromEntries([
    [path, rule],
    // Nested routes need their own entry: a rule for '/dashboard' does not
    // match '/dashboard/my-cars'.
    [`${path}/**`, rule],
    ...LOCALE_CODES.flatMap(code => [
      [`/${code}${path}`, rule],
      [`/${code}${path}/**`, rule],
    ]),
  ])

export default defineNuxtConfig({
  compatibilityDate: '2025-09-24',

  // Performance optimizations
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
      ]
    }
  },

  runtimeConfig: {
    // Private - server only
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
  },

  nitro: {
    compatibilityDate: '2025-08-05',
    preset: 'node-server',
    // Enable compression
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
  },

  // ── Route rules ───────────────────────────────────────────────────────────
  // Single block. Previously these were split between `nitro.routeRules` and a
  // top-level `routeRules`, which made it very easy to believe a rule applied
  // when it didn't.
  //
  // IMPORTANT: only cache read-only GET endpoints. A blanket '/api/cars/**'
  // rule also matches POST/DELETE routes (create, bid, feature, delete…), and
  // Nitro's cached handler does NOT forward the request body — so readBody()
  // returns undefined and every mutation 400s. Cache each safe GET path
  // explicitly instead.
  routeRules: {
    '/api/**': { cors: true },
    ...Object.fromEntries(LOCALE_CODES.map(code => [`/${code}/api/**`, { cors: true }])),

    // The locale home pages are the same for every visitor (the header renders
    // logged-out on the server and hydrates), so they are safe to cache.
    // NOTE: the bare '/' is deliberately NOT prerendered — @nuxtjs/i18n owns it
    // and turns it into a language redirect. Prerendering that froze one
    // language into a static file.
    ...Object.fromEntries(LOCALE_CODES.map(code => [`/${code}`, { cache: { maxAge: 300, swr: true } }])),

    '/api/cars': { cache: { maxAge: 60, swr: true } },
    '/api/cars/featured': { cache: { maxAge: 120, swr: true } },
    '/api/cars/filters': { cache: { maxAge: 300, swr: true } },

    // The admin panel is entirely client-driven (it reads the Supabase session
    // from the browser), so there is nothing useful to server-render and SSR
    // only produces a flash of the "Access Restricted" screen.
    ...localeRouteRules('/admin', { ssr: false }),

    // Pages that depend on the logged-in user must not be cached or prerendered.
    ...localeRouteRules('/profile', { ssr: false }),
    ...localeRouteRules('/dashboard', { ssr: false }),
    ...localeRouteRules('/messages', { ssr: false }),
    ...localeRouteRules('/sell', { ssr: false }),
    ...localeRouteRules('/reset-password', { ssr: false }),
    ...localeRouteRules('/cars/edit', { ssr: false }),
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  css: ['@/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'fr', iso: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'ro', iso: 'ro-RO', file: 'ro.json', name: 'Română' },
      { code: 'sr', iso: 'sr-RS', file: 'sr.json', name: 'Srpski' },
      { code: 'ar', iso: 'ar', file: 'ar.json', name: 'العربية', dir: 'rtl' },
      { code: 'bg', iso: 'bg-BG', file: 'bg.json', name: 'Bulgarian' },
      { code: 'uk', iso: 'uk-UA', file: 'uk.json', name: 'Ukrainian' },
      { code: 'el', iso: 'el-GR', file: 'el.json', name: 'Greek' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Russian' },
      { code: 'pl', iso: 'pl-PL', file: 'pl.json', name: 'Polski' },
      { code: 'sq', iso: 'sq-AL', file: 'sq.json', name: 'Shqip' },
      { code: 'es', iso: 'es-ES', file: 'es.json', name: 'Español' },
      { code: 'it', iso: 'it-IT', file: 'it.json', name: 'Italiano' },
    ],
    types: 'composition',
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
    vueI18n: './i18n.config.ts',
    // Optimize i18n bundle
    bundle: {
      optimizeTranslationDirective: true,
    },
  },

  // Build optimizations
  build: {
    transpile: ['@headlessui/vue', '@heroicons/vue'],
  },

  // Vite optimizations
  vite: {
    optimizeDeps: {
      include: ['@headlessui/vue'],
    },
    build: {
      // Was 'esnext', which tells esbuild to down-level NOTHING. Any modern
      // syntax in the app or its dependencies then reaches the browser as-is,
      // and a browser that cannot parse it renders a blank white page with no
      // error the user can see — the "it doesn't open on some browsers" report.
      // This target covers every browser still in real-world use.
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router'],
            'vendor-i18n': ['vue-i18n'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-headless': ['@headlessui/vue', '@heroicons/vue'],
          },
        },
      },
    },
  },

  devtools: { enabled: false },

  typescript: {
    strict: false,
    typeCheck: false,
    shim: false,
  },

  // Kept from the previous config so the CSS delivery behaviour does not change.
  features: {
    inlineStyles: false,
  },

  // Experimental features for performance
  experimental: {
    asyncContext: true,
    appManifest: true,
    payloadExtraction: true,
    // viewTransition was enabled here. It is unsupported in Safari < 18 and in
    // every Firefox release to date, and Nuxt's fallback path has caused blank
    // renders on those browsers. Not worth the risk on a live marketplace.
  },

  // Image optimization (using built-in Nuxt Image if available)
  // Note: @nuxt/image module would be ideal but requires installation
  image: {
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },
})

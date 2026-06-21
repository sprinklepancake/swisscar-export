// nuxt.config.ts
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
    // Add route rules for caching
    routeRules: {
      '/': { prerender: true, cache: { maxAge: 300, swr: true } },
      '/en': { prerender: true, cache: { maxAge: 300, swr: true } },
      '/api/cars/**': { cache: { maxAge: 60, swr: true } },
      '/api/cars/featured': { cache: { maxAge: 120, swr: true } },
      '/api/cars/filters': { cache: { maxAge: 300, swr: true } },
      '/**': { cors: true },
    },
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
      { code: 'ar', iso: 'ar-AR', file: 'ar.json', name: 'Arabic' },
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
      target: 'esnext',
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
  
  // Experimental features for performance
  experimental: {
    asyncContext: true,
    appManifest: true,
    payloadExtraction: true,
    inlineSSRStyles: false,
    viewTransition: true,
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
    '/pl/api/**': { cors: true },
    '/sq/api/**': { cors: true },
    '/es/api/**': { cors: true },
    '/it/api/**': { cors: true },
    '/': { prerender: true },
    '/admin': { ssr: false },
    '/en/admin': { ssr: false },
    '/ar/admin': { ssr: false },
    '/el/admin': { ssr: false },
  },
})
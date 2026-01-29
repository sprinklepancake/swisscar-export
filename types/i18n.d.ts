export type LocaleCode = 'en'|'fr'|'de'|'ro'|'sr'|'ar'|'bg'|'uk'|'el'|'ru'

declare module '#app' {
  interface NuxtApp {
    $i18n: {
      locale: Ref<LocaleCode>
    }
  }
}

declare module 'vue-i18n' {
  interface I18n {
    locale: Ref<LocaleCode>
  }
}
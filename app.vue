<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// The <html> element carried no lang and no dir attribute at all. For Arabic
// that meant the entire site rendered left-to-right, and for every language it
// meant screen readers and search engines had no idea what language the page
// was in.
//
// The locale is read straight from vue-i18n rather than from useLocaleHead(),
// whose option names differ between @nuxtjs/i18n versions — this works the same
// on all of them.
const { locale, locales } = useI18n()

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

const htmlLang = computed(() => {
  const match: any = (locales.value as any[]).find((l: any) => (typeof l === 'string' ? l : l.code) === locale.value)
  return (match && typeof match !== 'string' && (match.iso || match.language)) || locale.value || 'en'
})

const htmlDir = computed(() => (RTL_LOCALES.has(locale.value) ? 'rtl' : 'ltr'))

useHead({
  htmlAttrs: {
    lang: htmlLang,
    dir: htmlDir,
  },
})
</script>

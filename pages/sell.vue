<template>
  <div class="min-h-screen bg-swiss-white py-12 px-4">
    <div class="max-w-5xl mx-auto">
      <CarListingForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const { t, locale } = useI18n()
watch(locale, () => {
  // This empty watch forces the component to react to locale changes
})
const pageTitle = computed(() => t('page_title'))
// SEO Meta
useHead({
  title: t('seo.sell.title'),
  meta: [
    { 
      name: 'description', 
      content: t('seo.sell.description') 
    }
  ]
})
</script>
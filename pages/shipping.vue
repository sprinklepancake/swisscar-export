<!-- pages/shipping.vue
     Linked from the main navigation and the footer, but the page did not exist
     — it 404'd for every visitor who clicked "Shipping". -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <div class="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <h1 class="text-3xl sm:text-4xl font-bold text-red-800 mb-3">{{ t('shipping_page.title') }}</h1>
      <p class="text-red-700 mb-10 max-w-2xl">{{ t('shipping_page.intro') }}</p>

      <!-- How export works -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div v-for="step in steps" :key="step.n" class="rounded-xl border border-red-200 bg-white p-6">
          <div class="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center mb-4">
            {{ step.n }}
          </div>
          <h2 class="font-semibold text-red-800 mb-2">{{ step.title }}</h2>
          <p class="text-gray-700 text-sm leading-relaxed">{{ step.body }}</p>
        </div>
      </div>

      <!-- Two legs -->
      <section class="rounded-xl border border-red-200 bg-white p-6 mb-8">
        <h2 class="text-xl font-semibold text-red-800 mb-3">{{ t('shipping_page.legs_title') }}</h2>
        <p class="text-gray-700 text-sm leading-relaxed mb-4">{{ t('shipping_page.legs_intro') }}</p>
        <ul class="space-y-3 text-sm text-gray-800">
          <li class="flex gap-3">
            <span class="shrink-0 mt-0.5 text-red-600">①</span>
            <span><strong class="text-red-800">{{ t('shipping_page.leg_one_title') }}</strong> — {{ t('shipping_page.leg_one_body') }}</span>
          </li>
          <li class="flex gap-3">
            <span class="shrink-0 mt-0.5 text-red-600">②</span>
            <span><strong class="text-red-800">{{ t('shipping_page.leg_two_title') }}</strong> — {{ t('shipping_page.leg_two_body') }}</span>
          </li>
        </ul>
      </section>

      <!-- Documents -->
      <section class="rounded-xl border border-red-200 bg-white p-6 mb-8">
        <h2 class="text-xl font-semibold text-red-800 mb-3">{{ t('shipping_page.documents_title') }}</h2>
        <ul class="space-y-2 text-sm text-gray-800 list-disc list-inside">
          <li>{{ t('shipping_page.doc_typenschein') }}</li>
          <li>{{ t('shipping_page.doc_registration') }}</li>
          <li>{{ t('shipping_page.doc_invoice') }}</li>
          <li>{{ t('shipping_page.doc_customs') }}</li>
        </ul>
        <p class="text-gray-600 text-xs mt-4">{{ t('shipping_page.documents_note') }}</p>
      </section>

      <!-- Costs -->
      <section class="rounded-xl border border-amber-300 bg-amber-50 p-6 mb-10">
        <h2 class="text-xl font-semibold text-amber-900 mb-2">{{ t('shipping_page.costs_title') }}</h2>
        <p class="text-amber-900 text-sm leading-relaxed">{{ t('shipping_page.costs_body') }}</p>
      </section>

      <div class="flex flex-wrap gap-3">
        <NuxtLink :to="localePath('/cars')" class="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
          {{ t('shipping_page.browse_cars') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="px-6 py-3 border border-red-600 text-red-700 rounded-lg font-semibold hover:bg-red-50">
          {{ t('contact') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const steps = computed(() => [
  { n: 1, title: t('shipping_page.step_one_title'), body: t('shipping_page.step_one_body') },
  { n: 2, title: t('shipping_page.step_two_title'), body: t('shipping_page.step_two_body') },
  { n: 3, title: t('shipping_page.step_three_title'), body: t('shipping_page.step_three_body') },
])

useHead({
  title: t('shipping_page.title'),
  meta: [{ name: 'description', content: t('shipping_page.intro') }],
})
</script>

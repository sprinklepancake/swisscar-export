<!-- pages/contact.vue
     The header AND the footer have always linked to /contact, but the page did
     not exist — every visitor who clicked it got a 404.

     TODO before this is fully finished: replace [SUPPORT EMAIL] and
     [PHONE NUMBER] below with your real details (the same ones you put in
     pages/impressum.vue). -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <div class="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 class="text-3xl sm:text-4xl font-bold text-red-800 mb-3">{{ t('contact_page.title') }}</h1>
      <p class="text-red-700 mb-10">{{ t('contact_page.intro') }}</p>

      <div class="space-y-6">
        <!-- Talk to a seller -->
        <section class="rounded-xl border border-red-200 bg-white p-6">
          <h2 class="text-xl font-semibold text-red-800 mb-2">{{ t('contact_page.about_a_car_title') }}</h2>
          <p class="text-gray-700 text-sm leading-relaxed mb-4">{{ t('contact_page.about_a_car_body') }}</p>
          <NuxtLink :to="localePath('/cars')" class="inline-block px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
            {{ t('contact_page.browse_cars') }}
          </NuxtLink>
        </section>

        <!-- Account / verification -->
        <section class="rounded-xl border border-red-200 bg-white p-6">
          <h2 class="text-xl font-semibold text-red-800 mb-2">{{ t('contact_page.account_title') }}</h2>
          <p class="text-gray-700 text-sm leading-relaxed mb-4">{{ t('contact_page.account_body') }}</p>
          <NuxtLink :to="localePath('/profile')" class="inline-block px-5 py-2.5 border border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-50">
            {{ t('profile.quick_actions.view_profile') }}
          </NuxtLink>
        </section>

        <!-- Support -->
        <section class="rounded-xl border border-red-200 bg-white p-6">
          <h2 class="text-xl font-semibold text-red-800 mb-2">{{ t('contact_page.support_title') }}</h2>
          <p class="text-gray-700 text-sm leading-relaxed">
            {{ t('contact_page.support_body') }}
          </p>
          <dl class="mt-4 text-sm text-gray-800 space-y-1">
            <div class="flex gap-2">
              <dt class="font-medium text-red-800 w-20">{{ t('auth.email') }}</dt>
              <dd>[SUPPORT EMAIL]</dd>
            </div>
            <div class="flex gap-2">
              <dt class="font-medium text-red-800 w-20">{{ t('register.phone.label') }}</dt>
              <dd>[PHONE NUMBER]</dd>
            </div>
          </dl>
        </section>
      </div>

      <div class="mt-10 flex flex-wrap gap-4 text-sm">
        <NuxtLink :to="localePath('/impressum')" class="text-red-700 hover:text-red-900 font-medium">{{ t('contact_page.legal_notice') }}</NuxtLink>
        <NuxtLink :to="localePath('/terms')" class="text-red-700 hover:text-red-900 font-medium">{{ t('terms_of_service') }}</NuxtLink>
        <NuxtLink :to="localePath('/privacy')" class="text-red-700 hover:text-red-900 font-medium">{{ t('privacy_policy') }}</NuxtLink>
      </div>

      <NuxtLink :to="localePath('/')" class="inline-block mt-10 text-red-700 hover:text-red-900 font-medium">← {{ t('home') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: t('contact_page.title'),
  meta: [{ name: 'description', content: t('contact_page.intro') }],
})
</script>

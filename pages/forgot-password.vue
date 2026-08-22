<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
    <div class="glass p-8 rounded-2xl w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-red-800 mb-2">{{ t('auth.forgot_password_title') }}</h1>
      <p class="text-center text-red-600 text-sm mb-8">{{ t('auth.forgot_password_intro') }}</p>

      <div v-if="sent" class="rounded-lg border border-green-300 bg-green-50 p-4 text-center">
        <p class="text-green-800 text-sm">{{ t('auth.forgot_password_sent') }}</p>
        <NuxtLink :to="localePath('/login')" class="inline-block mt-4 text-red-800 hover:text-red-900 font-semibold text-sm">
          {{ t('auth.back_to_login') }}
        </NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            id="email"
            autocomplete="email"
            required
            class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :placeholder="t('placeholder.email')"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50"
        >
          {{ loading ? t('auth.sending') : t('auth.send_reset_link') }}
        </button>

        <div class="text-center">
          <NuxtLink :to="localePath('/login')" class="text-sm text-red-700 hover:text-red-900 underline">
            {{ t('auth.back_to_login') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

useHead({ title: t('auth.forgot_password_title') })

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      // The locale travels with the request so the emailed link brings the user
      // back to the language they were using.
      body: { email: email.value, locale: locale.value },
    })
    // Always report success — telling the visitor whether an address exists
    // would let anyone enumerate accounts.
    sent.value = true
  } catch {
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.2);
}
</style>

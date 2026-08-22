<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
    <div class="glass p-8 rounded-2xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-red-800 mb-8">{{ t('auth.login_title') }}</h1>

      <!-- Shown after a successful registration -->
      <div v-if="justRegistered" class="mb-6 rounded-lg border border-green-300 bg-green-50 p-4">
        <p class="text-green-800 text-sm font-semibold">{{ t('register.approval_notice_title') }}</p>
        <p class="text-green-700 text-sm mt-1">{{ t('register.approval_notice_body') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            id="email"
            autocomplete="email"
            required
            class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :placeholder="t('auth.email')"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.password') }}</label>
          <input
            v-model="password"
            type="password"
            id="password"
            autocomplete="current-password"
            required
            class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :placeholder="t('auth.password')"
          />
          <div class="text-right mt-2">
            <NuxtLink :to="localePath('/forgot-password')" class="text-sm text-red-700 hover:text-red-900 underline">
              {{ t('auth.forgot_password') }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50"
        >
          <span v-if="loading">{{ t('auth.logging_in') }}</span>
          <span v-else>{{ t('auth.login_button') }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-red-600">
        {{ t('auth.no_account') }}
        <NuxtLink :to="localePath('/register')" class="text-red-800 hover:text-red-900 font-semibold">{{ t('auth.signup_link') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuth()

const justRegistered = computed(() => route.query.registered === '1')

useHead({ title: t('auth.login_title') })

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const success = await auth.login(email.value, password.value)

    if (success) {
      const user = auth.user.value
      // Every one of these used to be an unprefixed path, which is a hard 404
      // under the i18n 'prefix' strategy — that is the "404 Page not found:
      // /login" users were seeing.
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
      const fallback = localePath(user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/dashboard' : '/')
      // startsWith('/') alone is not enough: "//evil.com" is a protocol-relative
      // URL and would send the user straight off the site after logging in.
      const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\')
      await navigateTo(safeRedirect ? redirect : fallback)
    } else {
      error.value = t('auth.invalid_credentials')
    }
  } catch (err: any) {
    error.value = err.message || t('auth.login_failed')
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

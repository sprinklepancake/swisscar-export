<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
    <div class="glass p-8 rounded-2xl w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-red-800 mb-8">{{ t('auth.reset_password_title') }}</h1>

      <!-- Waiting for Supabase to pick the recovery token out of the URL -->
      <div v-if="checking" class="text-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>

      <!-- Link expired or opened in a different browser -->
      <div v-else-if="!hasRecoverySession" class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-center">
        <p class="text-amber-900 text-sm">{{ t('auth.reset_link_invalid') }}</p>
        <NuxtLink :to="localePath('/forgot-password')" class="inline-block mt-4 text-red-800 hover:text-red-900 font-semibold text-sm">
          {{ t('auth.request_new_link') }}
        </NuxtLink>
      </div>

      <div v-else-if="done" class="rounded-lg border border-green-300 bg-green-50 p-4 text-center">
        <p class="text-green-800 text-sm">{{ t('auth.password_changed') }}</p>
        <NuxtLink :to="localePath('/login')" class="inline-block mt-4 text-red-800 hover:text-red-900 font-semibold text-sm">
          {{ t('auth.back_to_login') }}
        </NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.new_password') }}</label>
          <input
            v-model="password"
            type="password"
            id="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <p class="text-red-600 text-xs mt-1">{{ t('register.password.min_length') }}</p>
        </div>

        <div>
          <label for="confirm" class="block text-sm font-medium text-red-700 mb-2">{{ t('register.password.confirm_label') }}</label>
          <input
            v-model="confirm"
            type="password"
            id="confirm"
            autocomplete="new-password"
            required
            class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50"
        >
          {{ loading ? t('profile.saving') : t('auth.set_new_password') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page is reached from the email Supabase sends. The link carries a
// recovery token; the Supabase client picks it up (detectSessionInUrl) and
// opens a short-lived session that is only good for changing the password.
const { t } = useI18n()
const localePath = useLocalePath()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const checking = ref(true)
const hasRecoverySession = ref(false)
const done = ref(false)
const error = ref('')

useHead({ title: t('auth.reset_password_title') })

const getSupabase = () => {
  try {
    const { $supabase } = useNuxtApp()
    return ($supabase as any) || null
  } catch {
    return null
  }
}

onMounted(async () => {
  const supabase = getSupabase()
  if (!supabase) {
    checking.value = false
    return
  }

  // Supabase parses the token from the URL fragment asynchronously, so poll
  // briefly instead of reading the session exactly once and giving up.
  for (let attempt = 0; attempt < 12; attempt++) {
    const { data } = await supabase.auth.getSession()
    if (data?.session) {
      hasRecoverySession.value = true
      break
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  checking.value = false
})

const submit = async () => {
  error.value = ''

  if (password.value.length < 8) {
    error.value = t('register.validation.password_length')
    return
  }
  if (password.value !== confirm.value) {
    error.value = t('register.validation.passwords_not_match')
    return
  }

  const supabase = getSupabase()
  if (!supabase) {
    error.value = t('auth.reset_link_invalid')
    return
  }

  loading.value = true
  try {
    const { error: updateError } = await supabase.auth.updateUser({ password: password.value })
    if (updateError) throw new Error(updateError.message)

    // Force a clean login with the new password everywhere.
    await supabase.auth.signOut()
    done.value = true
  } catch (err: any) {
    error.value = err.message || t('auth.password_change_failed')
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

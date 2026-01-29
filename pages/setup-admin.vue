<!-- pages/setup-admin.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Setup</h1>
        <p class="text-gray-600 mt-2">Create the first admin user for SwissCarExport</p>
      </div>

      <form @submit.prevent="createAdmin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="admin@swisscarexport.ch"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="Minimum 8 characters"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Admin User"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          >
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span v-if="loading">Creating Admin...</span>
          <span v-else>Create Admin Account</span>
        </button>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-700 font-medium">{{ error }}</span>
          </div>
        </div>

        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <p class="text-green-700 font-medium">{{ success }}</p>
              <p class="text-green-600 text-sm mt-1">
                You can now log in at <a href="/login" class="underline font-semibold">Login Page</a>
              </p>
            </div>
          </div>
        </div>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="text-sm text-gray-500">
          <p class="font-medium text-gray-700">Information:</p>
          <ul class="mt-2 space-y-1">
            <li>• This page will only work if no admin exists yet</li>
            <li>• After creating admin, you can access /admin</li>
            <li>• Keep credentials secure</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const createAdmin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/admin/setup', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        name: name.value
      }
    })

    if (response.success) {
      success.value = '✅ Admin account created successfully!'
      // Clear form
      email.value = ''
      password.value = ''
      name.value = ''
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
    } else {
      error.value = response.message || 'Failed to create admin'
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'An error occurred'
    console.error('Setup error:', err)
  } finally {
    loading.value = false
  }
}
</script>
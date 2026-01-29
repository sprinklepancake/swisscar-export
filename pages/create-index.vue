<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Create Typenschein Index</h1>
        
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-blue-800">
            This will create an index file from your large Typenschein database for faster searching.
            This only needs to be done once.
          </p>
        </div>

        <button 
          @click="createIndex" 
          :disabled="loading"
          class="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Index... (This may take a few minutes)
          </span>
          <span v-else>
            Create Typenschein Index
          </span>
        </button>
        
        <div v-if="result" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 class="text-lg font-semibold text-green-800 mb-2">Success!</h3>
          <p class="text-green-700"><strong>Entries processed:</strong> {{ result.entries.toLocaleString() }}</p>
          <p class="text-green-700"><strong>File location:</strong> {{ result.filePath }}</p>
          <p class="text-green-700 mt-2">You can now use the Typenschein search in your car listing form!</p>
        </div>
        
        <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error:</h3>
          <p class="text-red-700">{{ error }}</p>
          <button 
            @click="retry" 
            class="mt-3 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>

        <div class="mt-6 text-sm text-gray-600">
          <p><strong>Note:</strong> This process reads your large Typenschein JSON file and creates a smaller index file for fast searching.</p>
          <p class="mt-2">After creating the index, you can test it by going to your car selling form and trying a Typenschein number like "1PA480".</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string>('')

const createIndex = async () => {
  loading.value = true
  result.value = null
  error.value = ''
  
  try {
    const response = await $fetch('/api/typenschein/create-index', {
      method: 'POST'
    })
    result.value = response
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.message || 'Unknown error occurred'
    console.error('Index creation error:', err)
  } finally {
    loading.value = false
  }
}

const retry = () => {
  error.value = ''
  createIndex()
}
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-red-800 mb-6">Seller Dashboard</h1>
    
    <!-- Loading state -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p class="text-red-600">Loading dashboard...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 rounded-xl p-6 text-center border border-red-300">
      <p class="text-red-700">{{ error }}</p>
      <NuxtLink to="/login" class="text-red-800 hover:underline mt-2 inline-block">
        Please login to access dashboard
      </NuxtLink>
    </div>
    
    <!-- Dashboard content -->
    <div v-else>
      <!-- Welcome message -->
      <div class="bg-gradient-to-r from-red-100 to-red-200 rounded-xl p-6 mb-6 border border-red-300">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-red-800">Welcome back, {{ dashboardData.user?.name || 'Seller' }}!</h2>
            <p class="text-red-600">Here's your seller dashboard overview</p>
          </div>
          <div class="bg-white/50 rounded-lg p-4 text-center border border-red-200">
            <p class="text-red-600 text-sm">Account Balance</p>
            <p class="text-2xl font-bold text-red-800">{{ dashboardData.user?.funds || 0 }} CHF</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- List New Car Card -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-lg font-semibold text-red-800 mb-4">List a New Car</h2>
          <NuxtLink 
            to="/sell" 
            class="inline-block w-full py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg text-center font-medium text-white hover:from-red-700 hover:to-red-900 transition-all duration-200"
          >
            Add New Listing
          </NuxtLink>
          <p class="text-sm text-red-600 mt-3">
            {{ freeListingsLeft }} free listings remaining this month
          </p>
        </div>

        <!-- Statistics Card -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-lg font-semibold text-red-800 mb-4">Your Statistics</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-red-600">Active Listings:</span>
              <span class="font-medium text-red-800">{{ dashboardData.stats?.activeListings || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Cars Sold:</span>
              <span class="font-medium text-red-800">{{ dashboardData.stats?.totalCars || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Total Earnings:</span>
              <span class="font-medium text-red-800">{{ dashboardData.stats?.totalEarnings || 0 }} CHF</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-600">Monthly Earnings:</span>
              <span class="font-medium text-red-800">{{ dashboardData.stats?.monthlyEarnings || 0 }} CHF</span>
            </div>
          </div>
        </div>

        <!-- Recent Messages Card -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-lg font-semibold text-red-800 mb-4">Recent Sales</h2>
          <div v-if="dashboardData.recentSales && dashboardData.recentSales.length > 0" class="space-y-3">
            <div v-for="sale in dashboardData.recentSales.slice(0, 3)" :key="sale.id" class="border-b border-red-200 pb-3 last:border-b-0">
              <p class="text-red-800 text-sm font-medium">{{ sale.car }}</p>
              <p class="text-red-600 text-xs">{{ sale.price }} CHF</p>
              <p class="text-red-500 text-xs mt-1">{{ formatDate(sale.date) }}</p>
            </div>
          </div>
          <p v-else class="text-red-600 text-sm">No recent sales</p>
        </div>
      </div>

      <!-- Active Listings Section -->
      <div class="glass p-6 rounded-xl border border-red-200">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-red-800">Your Active Listings</h2>
          <div class="flex items-center space-x-4">
            <select v-model="filterStatus" class="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-800 text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
            <button @click="refreshData" class="p-2 text-red-600 hover:text-red-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b border-red-200">
                <th class="pb-3 text-red-600 font-medium">Car</th>
                <th class="pb-3 text-red-600 font-medium">Price</th>
                <th class="pb-3 text-red-600 font-medium">Status</th>
                <th class="pb-3 text-red-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="car in filteredListings" :key="car.id" class="border-b border-red-200 hover:bg-red-50/50 transition-colors">
                <td class="py-4">
                  <div class="flex items-center group">
                    <div class="w-16 h-16 bg-red-100 rounded-md flex items-center justify-center mr-3">
                      <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-red-800 font-medium">
                        {{ car.make }} {{ car.model }}
                      </p>
                      <p class="text-red-600 text-sm">{{ car.year }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 text-red-800 font-semibold">
                  {{ car.price }} CHF
                </td>
                <td class="py-4">
                  <span :class="statusClass(car.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ car.status }}
                  </span>
                </td>
                <td class="py-4">
                  <div class="flex space-x-2">
                    <button 
                      @click="editListing(car.id)"
                      class="p-2 text-red-700 hover:text-red-900 bg-red-100 rounded-lg transition-colors"
                      title="Edit Listing"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button 
                      @click="confirmDelete(car.id)"
                      class="p-2 text-red-700 hover:text-red-900 bg-red-100 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredListings.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="text-red-600 mb-4">No listings found</p>
          <NuxtLink 
            to="/sell" 
            class="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200"
          >
            Create Your First Listing
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <!-- Performance Overview -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-lg font-semibold text-red-800 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="viewAnalytics"
              class="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <svg class="w-6 h-6 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span class="text-red-800 text-sm">Analytics</span>
            </button>
            <button 
              @click="viewSettings"
              class="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <svg class="w-6 h-6 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-red-800 text-sm">Settings</span>
            </button>
            <button 
              @click="viewPayments"
              class="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <svg class="w-6 h-6 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span class="text-red-800 text-sm">Payments</span>
            </button>
            <button 
              @click="viewSupport"
              class="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <svg class="w-6 h-6 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span class="text-red-800 text-sm">Support</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-lg font-semibold text-red-800 mb-4">Recent Activity</h2>
          <div v-if="dashboardData.recentSales && dashboardData.recentSales.length > 0" class="space-y-3">
            <div v-for="sale in dashboardData.recentSales.slice(0, 5)" :key="sale.id" class="border-b border-red-200 pb-3 last:border-b-0">
              <p class="text-red-800 text-sm">Sold {{ sale.car }} for {{ sale.price }} CHF</p>
              <p class="text-red-500 text-xs mt-1">{{ formatDate(sale.date) }}</p>
            </div>
          </div>
          <p v-else class="text-red-600 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const error = ref('')
const filterStatus = ref('all')
const freeListingsLeft = ref(5)

// Use a single reactive state for dashboard data
const dashboardData = ref({
  user: {
    name: '',
    funds: 0
  },
  stats: {
    activeListings: 0,
    totalCars: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    soldCars: 0
  },
  recentSales: [],
  listings: []
})

// Fetch all dashboard data in parallel using a single API call
const { data, pending, error: fetchError, refresh } = useLazyFetch('/api/seller/dashboard', {
  key: 'dashboard-data',
  onResponseError({ response }) {
    if (response.status === 401 || response.status === 403) {
      navigateTo('/login')
    }
  }
})

// Watch for data changes
watchEffect(() => {
  if (data.value) {
    dashboardData.value = data.value
    console.log('Dashboard data loaded:', data.value)
  }
  loading.value = pending.value
  error.value = fetchError.value?.message || ''
})

// Filter listings based on status
const filteredListings = computed(() => {
  const listings = dashboardData.value.listings || []
  if (filterStatus.value === 'all') {
    return listings
  }
  return listings.filter(car => car.status === filterStatus.value)
})

// Status class mapping
const statusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'sold':
      return 'bg-red-100 text-red-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Refresh data
const refreshData = async () => {
  await refresh()
}

// Delete confirmation
const confirmDelete = (carId: number) => {
  if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    deleteListing(carId)
  }
}

// Delete listing
const deleteListing = async (carId: number) => {
  try {
    await $fetch(`/api/seller/listings/${carId}`, {
      method: 'DELETE'
    })
    await refreshData()
    alert('Listing deleted successfully!')
  } catch (error) {
    console.error('Failed to delete listing:', error)
    alert('Failed to delete listing. Please try again.')
  }
}

// Edit listing
const editListing = (carId: number) => {
  navigateTo(`/seller/cars/edit/${carId}`)
}

// Quick actions
const viewAnalytics = () => {
  alert('Analytics page coming soon!')
}

const viewSettings = () => {
  navigateTo('/profile')
}

const viewPayments = () => {
  alert('Payments page coming soon!')
}

const viewSupport = () => {
  alert('Support page coming soon!')
}
</script>

<style scoped>
.glass {
  @apply bg-white/70 backdrop-blur-md border border-red-200;
}

/* Smooth transitions for all interactive elements */
tr {
  transition: all 0.2s ease-in-out;
}

/* Hover effects for cards */
.glass:hover {
  @apply shadow-lg transform transition-all duration-200;
}
</style>
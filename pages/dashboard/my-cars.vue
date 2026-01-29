<!-- pages/dashboard/my-cars.vue - NEW FILE -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Cars</h1>
        <p class="text-gray-600 mt-2">Manage your car listings</p>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Listings</p>
              <p class="text-2xl font-bold text-gray-900">{{ cars.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Active</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeCars.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Featured</p>
              <p class="text-2xl font-bold text-gray-900">{{ featuredCars.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Auctions</p>
              <p class="text-2xl font-bold text-gray-900">{{ auctionCars.length }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cars List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex flex-col md:flex-row md:items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">My Car Listings</h2>
            <div class="mt-2 md:mt-0">
              <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="draft">Draft</option>
                <option value="auction">Auction</option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading your cars...</p>
        </div>
        
        <div v-else-if="filteredCars.length === 0" class="p-8 text-center">
          <div class="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
          <p class="text-gray-600 mb-6">You haven't listed any cars yet.</p>
          <NuxtLink to="/sell" class="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            List Your First Car
          </NuxtLink>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div v-for="car in filteredCars" :key="car.id" class="p-6 hover:bg-gray-50">
            <div class="flex flex-col lg:flex-row lg:items-center">
              <!-- Car Image -->
              <div class="lg:w-1/4 mb-4 lg:mb-0 lg:mr-6">
                <div class="relative h-48 lg:h-32 rounded-lg overflow-hidden">
                  <img 
                    :src="car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg'" 
                    :alt="`${car.make} ${car.model}`"
                    class="w-full h-full object-cover"
                  />
                  <!-- Featured Badge -->
                  <div v-if="car.isFeatured && car.featuredUntil && new Date(car.featuredUntil) > new Date()" class="absolute top-2 left-2">
                    <div class="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured
                    </div>
                  </div>
                  <!-- Auction Badge -->
                  <div v-if="car.listingType === 'auction'" class="absolute top-2 right-2">
                    <div class="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Auction
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Car Info -->
              <div class="lg:w-2/4 mb-4 lg:mb-0 lg:mr-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ car.make }} {{ car.model }} ({{ car.year }})
                </h3>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {{ car.status }}
                  </span>
                  <span v-if="car.listingType === 'auction'" class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    Auction
                  </span>
                  <span v-if="car.isFeatured && car.featuredUntil && new Date(car.featuredUntil) > new Date()" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Featured ({{ calculateDaysRemaining(car.featuredUntil) }}d left)
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatPrice(car.price || car.startingPrice) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatMileage(car.mileage) }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ car.city }}, {{ car.canton }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(car.createdAt) }}
                  </div>
                </div>
                <div v-if="car.listingType === 'auction' && car.auctionEnd" class="mt-2">
                  <div class="text-sm text-gray-600 flex items-center">
                    <svg class="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auction ends: {{ formatDate(car.auctionEnd) }}
                    <span v-if="car.bidCount > 0" class="ml-2 text-purple-600 font-medium">
                      ({{ car.bidCount }} bids)
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="lg:w-1/4">
                <div class="flex flex-col space-y-2">
                  <!-- View Button -->
                  <NuxtLink 
                    :to="`/cars/${car.id}`"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium text-sm"
                  >
                    View
                  </NuxtLink>
                  
                  <!-- Feature Button -->
                  <FeatureButton 
                    :car-id="car.id"
                    :is-featured="car.isFeatured"
                    :featured-until="car.featuredUntil"
                    :featured-days-remaining="calculateDaysRemaining(car.featuredUntil)"
                    class="w-full"
                  />
                  
                  <!-- Edit Button -->
                  <button
                    @click="editCar(car.id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                  
                  <!-- Status Button -->
                  <button
                    v-if="car.status === 'active'"
                    @click="markAsSold(car.id)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    Mark as Sold
                  </button>
                  <button
                    v-else-if="car.status === 'draft'"
                    @click="activateCar(car.id)"
                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm"
                  >
                    Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FeatureButton from '~/components/FeatureButton.vue'

interface Car {
  id: number
  make: string
  model: string
  year: number
  price: number
  startingPrice?: number
  mileage: number
  images: string[]
  status: string
  city: string
  canton: string
  createdAt: string
  isFeatured: boolean
  featuredUntil?: string
  listingType: 'normal' | 'auction'
  auctionEnd?: string
  bidCount?: number
}

const loading = ref(true)
const cars = ref<Car[]>([])
const statusFilter = ref('all')

// Computed properties
const filteredCars = computed(() => {
  if (statusFilter.value === 'all') return cars.value
  return cars.value.filter(car => car.status === statusFilter.value)
})

const activeCars = computed(() => {
  return cars.value.filter(car => car.status === 'active')
})

const featuredCars = computed(() => {
  return cars.value.filter(car => car.isFeatured && car.featuredUntil && new Date(car.featuredUntil) > new Date())
})

const auctionCars = computed(() => {
  return cars.value.filter(car => car.listingType === 'auction')
})

// Methods
const formatPrice = (price: number) => {
  if (!price) return 'Price on request'
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatMileage = (mileage: number) => {
  if (!mileage) return 'N/A'
  return new Intl.NumberFormat('de-CH').format(mileage) + ' km'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

const calculateDaysRemaining = (featuredUntil?: string) => {
  if (!featuredUntil) return 0
  const now = new Date()
  const end = new Date(featuredUntil)
  const diffMs = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

const loadMyCars = async () => {
  try {
    loading.value = true
    const { data } = await useFetch('/api/cars/my', {
      credentials: 'include'
    })
    
    if (data.value) {
      cars.value = data.value
    }
  } catch (error) {
    console.error('Error loading cars:', error)
  } finally {
    loading.value = false
  }
}

const editCar = (carId: number) => {
  // Navigate to edit page
  navigateTo(`/cars/edit/${carId}`)
}

const markAsSold = async (carId: number) => {
  if (!confirm('Are you sure you want to mark this car as sold?')) return
  
  try {
    const { data } = await useFetch(`/api/cars/${carId}/sold`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      await loadMyCars()
      alert('Car marked as sold!')
    }
  } catch (error) {
    console.error('Error marking as sold:', error)
    alert('Failed to mark as sold')
  }
}

const activateCar = async (carId: number) => {
  try {
    const { data } = await useFetch(`/api/cars/${carId}/activate`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      await loadMyCars()
      alert('Car activated!')
    }
  } catch (error) {
    console.error('Error activating car:', error)
    alert('Failed to activate car')
  }
}

onMounted(() => {
  loadMyCars()
})
</script>
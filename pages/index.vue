<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div class="absolute top-40 right-20 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-6000"></div>
      </div>
      
      <!-- Hero Content -->
      <div class="relative z-10 text-center px-4 max-w-7xl mx-auto">
        <div class="mb-8 transform hover:scale-105 transition-transform duration-300">
          <h1 class="text-6xl md:text-8xl font-bold text-red-800 mb-6 leading-tight text-shadow">
            {{ t('hero_title') }}
          </h1>
          <p class="text-xl md:text-2xl text-red-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            {{ t('hero_subtitle') }}
          </p>
        </div>

        <!-- Enhanced Search Bar -->
        <div class="glass rounded-3xl p-6 md:p-8 mb-8 border border-red-200 shadow-2xl backdrop-blur-lg">
          <!-- Basic Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Make Filter -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('make_label') }}</label>
              <select v-model="filters.make" @change="onMakeChange" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_make') }}</option>
                <option v-for="make in filterOptions.makes" :key="make" :value="make">{{ make }}</option>
              </select>
            </div>
            
            <!-- Model Filter (dependent on make) -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('model_label') }}</label>
              <select v-model="filters.model" :disabled="!filters.make || loadingFilters" class="search-input">
                <option value="">{{ t('any_model') }}</option>
                <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
              </select>
            </div>
            
            <!-- Price Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('price_range_label') }}</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-700 text-sm font-semibold">CHF</span>
                  <input v-model.number="filters.priceMin" type="number" :placeholder="t('min_price')" 
                         class="search-input pl-10" :disabled="loadingFilters">
                </div>
                <span class="text-red-700 self-center">-</span>
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-700 text-sm font-semibold">CHF</span>
                  <input v-model.number="filters.priceMax" type="number" :placeholder="t('max_price')" 
                        class="search-input pl-10" :disabled="loadingFilters">
                </div>
              </div>
            </div>
          </div>

          <!-- Second Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Year Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('year_range_label') }}</label>
              <div class="flex gap-2">
                <select v-model="filters.yearMin" class="search-input" :disabled="loadingFilters">
                  <option value="">{{ t('min_year') }}</option>
                  <option v-for="year in yearOptions" :key="'min-' + year" :value="year">{{ year }}</option>
                </select>
                <span class="text-red-700 self-center">-</span>
                <select v-model="filters.yearMax" class="search-input" :disabled="loadingFilters">
                  <option value="">{{ t('max_year') }}</option>
                  <option v-for="year in yearOptions" :key="'max-' + year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <!-- Fuel Type Filter -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('fuel_type_label') }}</label>
              <select v-model="filters.fuelType" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_fuel') }}</option>
                <option value="petrol">{{ t('fuel_petrol') }}</option>
                <option value="diesel">{{ t('fuel_diesel') }}</option>
                <option value="electric">{{ t('fuel_electric') }}</option>
                <option value="hybrid">{{ t('fuel_hybrid') }}</option>
              </select>
            </div>
            
            <!-- Transmission Type -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('transmission_label') }}</label>
              <select v-model="filters.transmission" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_transmission') }}</option>
                <option value="manual">{{ t('transmission_manual') || 'Manual' }}</option>
                <option value="automatic">{{ t('transmission_automatic') || 'Automatic' }}</option>
                <option value="semi_automatic">{{ t('car_listing_form.semi_automatic') || 'Semi-Automatic' }}</option>
              </select>
            </div>
          </div>

          <!-- Quick Filters Toggle -->
          <div class="mb-4 text-center">
            <button @click="showQuickFilters = !showQuickFilters" class="text-red-700 hover:text-red-800 text-sm font-medium flex items-center justify-center mx-auto">
              {{ showQuickFilters ? t('hide_advanced_filters') : t('show_advanced_filters') }}
              <svg class="w-4 h-4 ml-1 transition-transform" :class="{ 'rotate-180': showQuickFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <!-- Quick Filters (Collapsible) -->
          <div v-if="showQuickFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-red-100/30 rounded-xl border border-red-200">
            <!-- Body Type -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('body_type_label') || 'Body Type' }}</label>
              <select v-model="filters.bodyType" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_body_type') || 'Any Body Type' }}</option>
                <option v-for="type in filterOptions.bodyTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <!-- Condition -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('condition_label') }}</label>
              <select v-model="filters.condition" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_condition') }}</option>
                <option value="excellent">{{ t('condition_excellent') }}</option>
                <option value="good">{{ t('condition_good') }}</option>
                <option value="fair">{{ t('condition_fair') }}</option>
                <option value="poor">{{ t('condition_poor') }}</option>
              </select>
            </div>
            
            <!-- Drive Type -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ t('drive_type_label') || 'Drive Type' }}</label>
              <select v-model="filters.driveType" class="search-input" :disabled="loadingFilters">
                <option value="">{{ t('any_drive_type') || 'Any Drive Type' }}</option>
                <option v-for="type in filterOptions.driveTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-center">
            <button @click="searchCars" class="search-button" :disabled="loadingFilters">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              {{ loadingFilters ? t('loading') || 'Loading...' : t('search_button') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Cars Section -->
    <section class="py-20 bg-gradient-to-br from-white to-red-50 relative">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold text-red-800 mb-4 text-shadow">{{ t('featured_title') }}</h2>
          <p class="text-xl text-red-700">{{ t('featured_subtitle') }}</p>
          
          <!-- Featured Count Badge -->
          <div class="inline-flex items-center bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full mt-4">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="font-semibold">{{ featuredCars.length }} {{ t('featured_cars_count') || 'Featured Cars' }}</span>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loadingFeaturedCars" class="text-center py-12">
          <div class="inline-flex items-center text-red-700">
            <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('loading_featured_cars') || 'Loading featured cars...' }}
          </div>
        </div>
        
        <!-- No Featured Cars -->
        <div v-else-if="featuredCars.length === 0" class="text-center py-12">
          <div class="glass p-8 rounded-2xl border border-red-200 max-w-md mx-auto">
            <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-xl font-bold text-red-800 mb-2">{{ t('no_featured_cars_title') || 'No Featured Cars Available' }}</h3>
            <p class="text-red-700">{{ t('no_featured_cars_message') || 'Be the first to feature your car!' }}</p>
            <NuxtLink :to="localePath('/sell')" class="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200">
              {{ t('list_your_car') || 'List Your Car' }}
            </NuxtLink>
          </div>
        </div>
        
        <!-- Featured Cars Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <div v-for="(car, index) in featuredCars" :key="car.id" 
               class="car-card group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
               :style="{ animationDelay: `${index * 0.05}s` }">
            
            <div class="relative h-40">
              <img 
                :src="car.images && car.images[0] ? car.images[0] : '/placeholder-car.jpg'" 
                :alt="`${car.make} ${car.model}`"
                class="w-full h-full object-cover"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div v-if="car.isFeatured" class="absolute top-2 left-2 bg-red-700 text-white px-2 py-0.5 rounded text-xs font-semibold">⭐ {{ t('featured') || 'Featured' }}</div>
            </div>
            
            <div class="p-4">
              <h3 class="font-bold text-red-900 text-sm truncate">{{ car.make }} {{ car.model }}</h3>
              <p class="text-red-700 text-xs mb-2">{{ car.year }} • {{ formatMileage(car.mileage) }}</p>
              
              <div class="flex justify-between items-center mb-3">
                <div class="text-red-800 font-bold text-sm">
                  {{ car.price ? `CHF ${formatPrice(car.price)}` : t('price_on_request') || 'On request' }}
                </div>
              </div>
              
              <!-- Quick Specs -->
              <div class="flex items-center text-xs text-red-700 mb-2 space-x-2 flex-wrap">
                <span>{{ formatFuelType(car.fuelType) }}</span>
                <span v-if="car.power">• {{ car.power }} PS</span>
                <span>• {{ formatTransmission(car.transmission) }}</span>
              </div>
              
              <!-- Location -->
              <div class="flex items-center text-xs text-gray-600 mb-3">
                <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="truncate">{{ car.city }}, {{ car.canton }}</span>
              </div>
              
              <!-- View Button -->
              <NuxtLink 
                :to="localePath(`/cars/${car.id}`)"
                class="block text-center px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200"
              >
                {{ t('view_details') }}
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <!-- Load More -->
        <div v-if="featuredCars.length > 20" class="mt-8 text-center">
          <button @click="loadMoreFeatured" :disabled="loadingMore" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            <span v-if="loadingMore">{{ t('loading') || 'Loading...' }}</span>
            <span v-else>{{ t('load_more_featured') || 'Load More Featured Cars' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Enhanced Features Section -->
    <section class="py-20 bg-gradient-to-br from-white to-red-50 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-red-800 mb-4 text-shadow">{{ t('why_title') }}</h2>
          <p class="text-xl text-red-700 max-w-3xl mx-auto">{{ t('why_subtitle') }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="feature.title" 
               class="feature-card group"
               :style="{ animationDelay: `${index * 0.2}s` }">
            <div class="feature-icon">
              <component :is="getFeatureIcon(feature.icon)" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-red-800 mb-4">{{ t(`features.${feature.key}.title`) || feature.title }}</h3>
            <p class="text-red-700 leading-relaxed">{{ t(`features.${feature.key}.desc`) || feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced Stats Section -->
    <section v-if="!loadingStats" class="py-20 bg-gradient-to-br from-red-50 to-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center transform hover:scale-105 transition-transform duration-300">
            <div class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-2">
              {{ stats.totalCars || '0' }}
            </div>
            <div class="text-red-700 font-medium">{{ t('stat_label_1') }}</div>
          </div>
          <div class="text-center transform hover:scale-105 transition-transform duration-300">
            <div class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-2">
              {{ stats.totalSellers || '0' }}
            </div>
            <div class="text-red-700 font-medium">{{ t('stat_label_2') }}</div>
          </div>
          <div class="text-center transform hover:scale-105 transition-transform duration-300">
            <div class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-2">
              {{ stats.totalUsers || '0' }}
            </div>
            <div class="text-red-700 font-medium">{{ t('stat_label_3') }}</div>
          </div>
          <div class="text-center transform hover:scale-105 transition-transform duration-300">
            <div class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-2">
              {{ stats.countriesServed || '50' }}+
            </div>
            <div class="text-red-700 font-medium">{{ t('stat_label_4') }}</div>
          </div>
        </div>
      </div>
    </section>
    <div v-else class="py-12 text-center text-red-700">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ t('loading') || 'Loading stats...' }}
      </div>
    </div>

    <!-- Enhanced Newsletter Section -->
    <section class="py-20 bg-gradient-to-br from-white to-red-50">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-red-800 mb-6 text-shadow">{{ t('newsletter_title') }}</h2>
        <p class="text-xl text-red-700 mb-8">{{ t('newsletter_desc') }}</p>
        
        <div class="glass rounded-3xl p-8 border border-red-200 max-w-2xl mx-auto">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input v-model="email" type="email" :placeholder="t('newsletter_placeholder')" 
                     class="newsletter-input"
                     @keyup.enter="subscribeNewsletter">
            </div>
            <button @click="subscribeNewsletter" :disabled="!email || isSubscribing" class="newsletter-button">
              <span v-if="isSubscribing" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('subscribing') || 'Subscribing...' }}
              </span>
              <span v-else class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                {{ t('newsletter_button') }}
              </span>
            </button>
          </div>
          <p class="text-sm text-red-600 mt-4">
            {{ t('newsletter_info') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '#app'
import { useLocalePath } from '#i18n'
import { navigateTo } from '#app'

const { t } = useI18n()
const localePath = useLocalePath()

// SEO Meta
useHead({
  title: t('seo.home.title') || 'Export Swiss - Premium Car Marketplace',
  meta: [
    { 
      name: 'description', 
      content: t('seo.home.description') || 'Discover premium Swiss cars at unbeatable prices. Export quality vehicles with Swiss precision and reliability.' 
    }
  ]
})

// ─── Static fallback make/model data ─────────────────────────────────────────
const staticMakeModels: Record<string, string[]> = {
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo', 'T-Roc', 'Touareg', 'Arteon', 'ID.3', 'ID.4', 'Touran', 'Sharan', 'Caddy', 'Transporter'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'e-tron GT'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'AMG GT', 'CLA', 'CLS', 'EQC', 'EQS', 'Vito', 'Sprinter'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'M3', 'M5'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Crossland', 'Grandland', 'Mokka', 'Zafira', 'Combo', 'Vivaro'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  'Smart': ['Fortwo', 'Forfour', '#1', '#3'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Highlander', 'Land Cruiser', 'Prius', 'C-HR', 'Hilux', 'GR86', 'GR Yaris', 'Supra', 'Avensis'],
  'Honda': ['Civic', 'Accord', 'HR-V', 'CR-V', 'Jazz', 'e', 'NSX', 'Type R'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'GT-R', '370Z', 'Navara'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5'],
  'Mitsubishi': ['Colt', 'Lancer', 'Outlander', 'Eclipse Cross', 'L200', 'ASX'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'BRZ', 'WRX'],
  'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Jimny', 'Ignis', 'Baleno'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'LX', 'LC', 'LM'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Explorer', 'Mustang', 'F-150', 'Ranger', 'Transit'],
  'Chevrolet': ['Spark', 'Malibu', 'Camaro', 'Corvette', 'Equinox', 'Traverse', 'Silverado'],
  'Cadillac': ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Avenger'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Journey'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Nexo'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'EV6', 'Niro', 'Stinger'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Koleos', 'Zoe', 'Arkana', 'Austral'],
  'Peugeot': ['108', '208', '308', '508', '2008', '3008', '5008', 'e-208', 'e-2008'],
  'Citroën': ['C1', 'C3', 'C4', 'C5', 'Berlingo', 'SpaceTourer'],
  'DS Automobiles': ['DS3', 'DS4', 'DS7', 'DS9'],
  'Fiat': ['500', 'Punto', 'Tipo', 'Panda', '500X', '500L', 'Ducato'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', '4C'],
  'Lancia': ['Ypsilon'],
  'Ferrari': ['Roma', 'Portofino', 'SF90', '296 GTB', 'F8 Tributo'],
  'Lamborghini': ['Huracan', 'Urus', 'Revuelto'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
  'Jaguar': ['E-Pace', 'F-Pace', 'I-Pace', 'F-Type', 'XE', 'XF', 'XJ'],
  'Mini': ['Cooper', 'Clubman', 'Countryman', 'Paceman', 'Roadster', 'Convertible'],
  'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Wraith', 'Dawn', 'Cullinan', 'Spectre'],
  'Aston Martin': ['Vantage', 'DB11', 'DBS', 'DBX'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
  'Polestar': ['Polestar 2', 'Polestar 3', 'Polestar 4'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  'Seat': ['Ibiza', 'Leon', 'Ateca', 'Arona', 'Tarraco'],
  'Cupra': ['Formentor', 'Born', 'Ateca'],
  'Dacia': ['Sandero', 'Duster', 'Logan', 'Spring'],
  'BYD': ['Atto 3', 'Han', 'Tang', 'Seal', 'Dolphin', 'Seagull'],
  'MG': ['MG3', 'MG ZS', 'MG HS', 'MG5', 'MG4', 'Cyberster'],
  'Geely': ['Emgrand', 'Atlas', 'Coolray'],
  'Nio': ['ET5', 'ET7', 'ES6', 'ES8', 'EC7'],
  'XPeng': ['P7', 'P5', 'G3', 'G9'],
}

const staticMakes = Object.keys(staticMakeModels)

// ─── State ────────────────────────────────────────────────────────────────────
const email = ref('')
const isSubscribing = ref(false)
const showQuickFilters = ref(false)
const loadingFeaturedCars = ref(false)
const loadingFilters = ref(false)
const loadingStats = ref(false)
const loadingMore = ref(false)

// Real Data — initialised with static data so dropdowns work immediately
const featuredCars = ref([])
const filterOptions = ref({
  makes: staticMakes,
  makeModels: staticMakeModels,
  fuelTypes: [],
  transmissionTypes: [],
  bodyTypes: [],
  conditions: [],
  driveTypes: [],
  sellerTypes: [],
  exteriorColors: [],
  interiorColors: [],
  doorOptions: [],
  seatOptions: [],
  cylinderOptions: [],
  equipmentFeatures: [],
  cantons: [],
  minYear: 2000,
  maxYear: new Date().getFullYear(),
  minPrice: 0,
  maxPrice: 100000
})
const stats = ref({
  totalCars: 0,
  totalUsers: 0,
  totalSellers: 0,
  countriesServed: 50
})

// Filters
const filters = ref({
  make: '',
  model: '',
  priceMin: null,
  priceMax: null,
  yearMin: '',
  yearMax: '',
  fuelType: '',
  transmission: '',
  bodyType: '',
  condition: '',
  driveType: ''
})

// Generate year options (last 30 years)
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let year = currentYear; year >= currentYear - 30; year--) {
    years.push(year)
  }
  return years
})

// Filter models based on selected make
const filteredModels = computed(() => {
  if (!filters.value.make || !filterOptions.value.makeModels[filters.value.make]) return []
  return filterOptions.value.makeModels[filters.value.make] || []
})

// Reset model when make changes
const onMakeChange = () => {
  filters.value.model = ''
}

// Fetch real data on mount
onMounted(async () => {
  await Promise.all([
    fetchFeaturedCars(),
    fetchFilterOptions(),
    fetchStats()
  ])
})

// Fetch featured cars from API
const fetchFeaturedCars = async () => {
  loadingFeaturedCars.value = true
  try {
    let data = null
    
    try {
      data = await $fetch('/api/cars/featured', { params: { limit: 20 } })
    } catch (error1) {
      const response = await $fetch('/api/cars', {
        params: { featured: true, limit: 20, status: 'active' }
      })
      data = response?.cars || response || []
    }
    
    let cars = []
    if (data && Array.isArray(data)) cars = data
    else if (data && data.featuredCars) cars = data.featuredCars
    else if (data && data.cars) cars = data.cars
    else cars = []
    
    featuredCars.value = cars
    
  } catch (error) {
    console.error('❌ Error fetching featured cars:', error)
    featuredCars.value = []
  } finally {
    loadingFeaturedCars.value = false
  }
}

// Fetch filter options from API — merges with static fallback
const fetchFilterOptions = async () => {
  loadingFilters.value = true
  try {
    let data = null
    
    try {
      data = await $fetch('/api/cars/filters')
    } catch (error1) {
      data = await $fetch('/api/cars/meta/filters')
    }
    
    if (data) {
      // Use API makeModels only if non-empty, otherwise keep static fallback
      const apiMakeModels = data.makeModels && Object.keys(data.makeModels).length > 0
        ? data.makeModels
        : staticMakeModels

      filterOptions.value = {
        makes: data.makes?.length > 0 ? data.makes : staticMakes,
        makeModels: apiMakeModels,
        fuelTypes: data.fuelTypes || [],
        transmissionTypes: data.transmissionTypes || [],
        bodyTypes: data.bodyTypes || [],
        conditions: data.conditions || [],
        driveTypes: data.driveTypes || [],
        sellerTypes: data.sellerTypes || [],
        exteriorColors: data.exteriorColors || [],
        interiorColors: data.interiorColors || [],
        doorOptions: data.doorOptions || [],
        seatOptions: data.seatOptions || [],
        cylinderOptions: data.cylinderOptions || [],
        equipmentFeatures: data.equipmentFeatures || [],
        cantons: data.cantons || [],
        minYear: data.minYear || 2000,
        maxYear: data.maxYear || currentYear,
        minPrice: data.minPrice || 0,
        maxPrice: data.maxPrice || 100000
      }
    }
  } catch (error) {
    console.error('Error fetching filter options, using static fallback:', error)
    // Full static fallback — makes & models always available
    filterOptions.value = {
      makes: staticMakes,
      makeModels: staticMakeModels,
      fuelTypes: [],
      transmissionTypes: [],
      bodyTypes: [],
      conditions: [],
      driveTypes: [],
      sellerTypes: [],
      exteriorColors: [],
      interiorColors: [],
      doorOptions: [],
      seatOptions: [],
      cylinderOptions: [],
      equipmentFeatures: [],
      cantons: [
        'Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden',
        'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft',
        'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen',
        'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura'
      ],
      minYear: 2000,
      maxYear: currentYear,
      minPrice: 0,
      maxPrice: 100000
    }
  } finally {
    loadingFilters.value = false
  }
}

// Fetch stats from API
const fetchStats = async () => {
  loadingStats.value = true
  try {
    let data = null
    
    try {
      data = await $fetch('/api/stats')
    } catch (error1) {
      try {
        data = await $fetch('/api/cars/stats')
      } catch (error2) {
        try {
          data = await $fetch('/api/dashboard/stats')
        } catch (error3) {
          data = null
        }
      }
    }
    
    if (data) {
      stats.value = {
        totalCars: data.totalCars || data.carsCount || data.totalCarsCount || 0,
        totalUsers: data.totalUsers || data.usersCount || data.totalUsersCount || 0,
        totalSellers: data.totalSellers || data.sellersCount || data.verifiedSellers || 0,
        countriesServed: data.countriesServed || 50
      }
    } else {
      stats.value = { totalCars: 0, totalUsers: 0, totalSellers: 0, countriesServed: 50 }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    stats.value = { totalCars: 0, totalUsers: 0, totalSellers: 0, countriesServed: 50 }
  } finally {
    loadingStats.value = false
  }
}

// Load more
const loadMoreFeatured = async () => {
  loadingMore.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  loadingMore.value = false
}

// Enhanced search function
const searchCars = () => {
  const queryParams: Record<string, any> = {}
  
  const filterMappings: Record<string, string> = {
    make: 'make', model: 'model',
    priceMin: 'priceMin', priceMax: 'priceMax',
    yearMin: 'yearMin', yearMax: 'yearMax',
    fuelType: 'fuelType', transmission: 'transmission',
    bodyType: 'bodyType', condition: 'condition', driveType: 'driveType'
  }
  
  Object.entries(filterMappings).forEach(([key, param]) => {
    if (filters.value[key as keyof typeof filters.value]) {
      queryParams[param] = filters.value[key as keyof typeof filters.value]
    }
  })
  
  navigateTo({ path: localePath('/cars'), query: queryParams })
}

// Features
const features = ref([
  {
    key: 'swiss_quality',
    icon: 'ShieldCheck',
    title: t('feature_1_title') || 'Swiss Quality',
    description: t('feature_1_desc') || 'Every vehicle meets strict Swiss quality standards.'
  },
  {
    key: 'affordable_prices',
    icon: 'Globe',
    title: t('feature_2_title') || 'Affordable Prices',
    description: t('feature_2_desc') || 'Competitive pricing with transparent costs.'
  },
  {
    key: 'global_shipping',
    icon: 'CurrencyDollar',
    title: t('feature_3_title') || 'Global Shipping',
    description: t('feature_3_desc') || 'We handle all export documentation and logistics.'
  }
])

// Newsletter subscription
const subscribeNewsletter = async () => {
  if (!email.value) return
  isSubscribing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Subscribed:', email.value)
    email.value = ''
  } catch (error) {
    console.error('Subscription failed:', error)
  } finally {
    isSubscribing.value = false
  }
}

// Helper functions
const formatPrice = (price: number) => {
  if (!price) return '0'
  return price.toLocaleString('de-CH')
}

const formatMileage = (mileage: number) => {
  if (!mileage) return '0 km'
  return mileage.toLocaleString('de-CH') + ' km'
}

const formatFuelType = (fuelType: string) => {
  if (!fuelType) return ''
  const types: Record<string, string> = {
    'petrol': t('fuel_petrol'),
    'diesel': t('fuel_diesel'),
    'electric': t('fuel_electric'),
    'hybrid': t('fuel_hybrid'),
    'lpg': 'LPG',
    'cng': 'CNG'
  }
  return types[fuelType.toLowerCase()] || fuelType.charAt(0).toUpperCase() + fuelType.slice(1)
}

const formatTransmission = (transmission: string) => {
  if (!transmission) return ''
  const types: Record<string, string> = {
    'manual': t('transmission_manual') || 'Manual',
    'automatic': t('transmission_automatic') || 'Automatic',
    'semi_automatic': t('car_listing_form.semi_automatic') || 'Semi-Automatic'
  }
  return types[transmission.toLowerCase()] || transmission.charAt(0).toUpperCase() + transmission.slice(1)
}

const getFeatureIcon = (_iconName: string) => {
  return 'div'
}
</script>

<style scoped>
.search-button {
  @apply px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center;
}

.feature-card {
  @apply bg-white/80 p-8 rounded-2xl border border-red-200 hover:bg-white transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl;
}

.feature-icon {
  @apply w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg;
}

.car-card {
  @apply bg-white/80 rounded-2xl overflow-hidden border border-red-200 hover:bg-white transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl;
}

.car-image {
  @apply relative h-48 bg-gradient-to-r from-red-100 to-red-200 overflow-hidden;
}

.car-status {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
}

.status-available { @apply bg-green-100 text-green-800; }
.status-reserved { @apply bg-yellow-100 text-yellow-800; }
.status-sold { @apply bg-gray-100 text-gray-800; }
.status-draft { @apply bg-blue-100 text-blue-800; }

.newsletter-input {
  @apply w-full p-4 rounded-xl bg-white/90 border border-red-300 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200;
}

.newsletter-input:focus {
  @apply bg-white shadow-lg;
}

.newsletter-button {
  @apply px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 shadow-lg;
}

.search-input {
  @apply w-full p-3 border border-red-200 rounded-xl bg-white/80 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200;
}
</style>
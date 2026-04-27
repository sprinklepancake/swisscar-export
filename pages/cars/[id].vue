<!-- pages/cars/[id].vue - UPDATED WITH VERIFICATION & BID ELIGIBILITY & HIDDEN CONTACT INFO & LIGHTBOX -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white py-4 sm:py-8 overflow-x-hidden">
    <!-- Error State -->
    <div v-if="error" class="max-w-4xl mx-auto px-4 text-center py-12">
      <div class="glass p-8 rounded-2xl border border-red-200">
        <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-bold text-red-800 mb-2">{{ $t('car_details.error.title') }}</h3>
        <p class="text-red-700 max-w-md mx-auto mb-6">{{ $t('car_details.error.message') }}</p>
        <NuxtLink to="/cars" class="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200">
          {{ $t('car_details.error.back_button') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="max-w-4xl mx-auto px-4 text-center py-12">
      <div class="glass p-8 rounded-2xl border border-red-200">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h3 class="text-xl font-bold text-red-800 mb-2">{{ $t('car_details.loading.title') }}</h3>
        <p class="text-red-700">{{ $t('car_details.loading.message') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="car" class="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6" style="overflow-x:hidden">
      <!-- Breadcrumb Navigation -->
      <div class="mb-6">
        <nav class="flex items-center space-x-2 text-sm text-red-700">
          <NuxtLink to="/" class="hover:text-red-900 transition-colors">{{ $t('home') }}</NuxtLink>
          <span class="text-red-400">/</span>
          <NuxtLink to="/cars" class="hover:text-red-900 transition-colors">{{ $t('cars_page.title') }}</NuxtLink>
          <span class="text-red-400">/</span>
          <span class="text-red-900 font-medium">{{ car.make }} {{ car.model }}</span>
        </nav>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <!-- Left Column - Images & Details -->
        <div class="lg:col-span-2 min-w-0 overflow-hidden">
          <!-- Image Gallery -->
          <div class="glass rounded-2xl overflow-hidden border border-red-200 shadow-lg mb-3 sm:mb-6">
            <!-- Main Image (clickable) -->
            <div 
              class="relative h-48 sm:h-64 md:h-80 bg-gradient-to-r from-red-100 to-red-200 overflow-hidden cursor-pointer"
              @click="openLightbox(currentImage)"
            >
              <img 
                :src="currentImage || car.images?.[0] || '/placeholder-car.jpg'" 
                :alt="`${car.make} ${car.model}`" 
                class="w-full h-full object-cover"
              >
              <div class="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1 sm:gap-2 max-w-[calc(100%-1rem)]">
                <div v-if="car.isFeatured" class="bg-red-700 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  ⭐ {{ $t('featured') }}
                </div>
                <div class="car-status text-xs px-2 py-0.5 sm:px-3 sm:py-1" :class="getStatusClass(car.status)">
                  {{ getStatusDisplay(car.status, car.listingType) }}
                </div>
                <div v-if="car.listingType === 'auction' && car.status === 'active'" class="bg-purple-700 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  🏆 {{ $t('auction.live_auction') }}
                </div>
                <div v-if="car.exportDocuments" class="bg-green-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  📄 {{ $t('export_ready') }}
                </div>
                <div v-if="car.withWarranty" class="bg-blue-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  🛡️ {{ $t('with_warranty') }}
                </div>
                <div v-if="car.validInspection" class="bg-green-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  ✅ {{ $t('valid_inspection') }}
                </div>
                <div v-if="car.hasAccident" class="bg-orange-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                  ⚠️ {{ $t('accident_vehicle') }}
                </div>
              </div>
            </div>

            <!-- Thumbnail Gallery -->
            <div v-if="car.images && car.images.length > 1" class="p-4 flex space-x-3 overflow-x-auto">
              <button 
                v-for="(img, index) in car.images" 
                :key="index"
                @click="currentImage = img"
                class="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all"
                :class="{'border-red-600': currentImage === img, 'border-transparent': currentImage !== img}"
              >
                <img :src="img" :alt="`${$t('car_details.thumbnail')} ${index + 1}`" class="w-full h-full object-cover">
              </button>
            </div>
          </div>

          <!-- Shipping Ad Section - Redesigned for mobile -->
          <div class="glass rounded-2xl p-3 sm:p-6 border border-red-200 shadow-lg mb-3 sm:mb-6">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-red-300 bg-white">
                <img 
                  src="/assets/images/car-transport.jpeg" 
                  :alt="$t('shipping_ad.alt_text')"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-red-900 truncate">{{ $t('shipping_ad.title') }}</p>
                <p class="text-xs text-red-600 truncate">{{ $t('shipping_ad.badge_text_short') }}</p>
                <p class="text-sm font-bold text-red-800 mt-0.5">076 448 08 49</p>
              </div>
              <a :href="`https://wa.me/41764480849?text=${encodeURIComponent($t('shipping_ad.whatsapp_message', { make: car.make, model: car.model, year: car.year }))}`" 
                 target="_blank"
                 class="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all duration-200">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          <!-- Car Details Tabs -->
          <div class="glass rounded-2xl border border-red-200 shadow-lg overflow-hidden min-w-0">
            <!-- Tab Navigation (horizontal scroll on mobile) -->
            <div class="border-b border-red-200 bg-red-50/50">
              <div class="flex overflow-x-auto scrollbar-hide">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center flex-shrink-0"
                  :class="{
                    'text-red-900 bg-white border-b-2 border-red-700 shadow-sm': activeTab === tab.id, 
                    'text-red-600 hover:text-red-800 hover:bg-red-100/50': activeTab !== tab.id
                  }"
                >
                  <svg class="w-4 h-4 mr-2 flex-shrink-0" :class="{'text-red-700': activeTab === tab.id, 'text-red-500': activeTab !== tab.id}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
                  </svg>
                  <span class="truncate">{{ $t(`car_details.tabs.${tab.id}`) }}</span>
                </button>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="p-3 sm:p-6">
              <!-- Specifications Tab -->
              <div v-if="activeTab === 'specs'" class="animate-fade-in">
                <h3 class="text-base sm:text-xl font-bold text-red-900 mb-3 sm:mb-6 flex items-center">
                  <svg class="w-4 h-4 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  {{ $t('car_details.specifications_title') }}
                </h3>
                <div class="grid grid-cols-1 gap-1">
                  <div v-for="(value, key) in carSpecs" :key="key" class="flex items-baseline justify-between py-2 border-b border-red-100 px-2 gap-3">
                    <span class="text-red-700 font-medium text-sm flex-1 min-w-0">{{ $t(`car_details.specs_labels.${key.toLowerCase().replace(/ /g, '_')}`, key) }}</span>
                    <span class="text-red-900 font-semibold text-sm flex-shrink-0 text-right max-w-[55%] break-words">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- Description Tab -->
              <div v-if="activeTab === 'description'" class="animate-fade-in">
                <h3 class="text-base sm:text-xl font-bold text-red-900 mb-3 sm:mb-6 flex items-center">
                  <svg class="w-4 h-4 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  {{ $t('car_details.description_title') }}
                </h3>
                
                <div class="bg-red-50 rounded-xl p-3 sm:p-6 mb-3 sm:mb-6 border border-red-200">
                  <h4 class="text-lg font-semibold text-red-900 mb-3">{{ $t('car_details.description_label') }}</h4>
                  <p class="text-red-800 leading-relaxed whitespace-pre-line">{{ car.description || $t('car_details.no_description') }}</p>
                </div>
                
                <!-- Features -->
                <div v-if="car.equipment && car.equipment.length" class="bg-red-50 rounded-xl p-3 sm:p-6 border border-red-200 mb-3 sm:mb-6">
                  <h4 class="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ $t('car_details.features_title') }}
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div v-for="(feature, index) in getFeatureLabels()" :key="index" class="flex items-center bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors">
                      <svg class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-red-800 text-sm">{{ feature }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Technical Details Tab -->
              <div v-if="activeTab === 'technical'" class="animate-fade-in">
                <h3 class="text-base sm:text-xl font-bold text-red-900 mb-3 sm:mb-6 flex items-center">
                  <svg class="w-4 h-4 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ $t('car_details.technical_title') }}
                </h3>
                <div class="grid grid-cols-1 gap-1">
                  <div v-for="(value, key) in technicalSpecs" :key="key" class="flex items-baseline justify-between py-2 border-b border-red-100 px-2 gap-3">
                    <span class="text-red-700 font-medium text-sm flex-1 min-w-0">{{ $t(`car_details.tech_labels.${key.toLowerCase().replace(/ /g, '_')}`, key) }}</span>
                    <span class="text-red-900 font-semibold text-sm flex-shrink-0 text-right max-w-[55%] break-words">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- Location Tab -->
              <div v-if="activeTab === 'location'" class="animate-fade-in">
                <h3 class="text-base sm:text-xl font-bold text-red-900 mb-3 sm:mb-6 flex items-center">
                  <svg class="w-4 h-4 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ $t('car_details.location_title') }}
                </h3>
                <div class="grid grid-cols-1 gap-1 mb-6 sm:mb-8">
                  <div v-for="(value, key) in locationInfo" :key="key" class="flex items-baseline justify-between py-2 border-b border-red-100 px-2 gap-3">
                    <span class="text-red-700 font-medium text-sm flex-1 min-w-0">{{ $t(`car_details.location_labels.${key.toLowerCase().replace(/ /g, '_')}`, key) }}</span>
                    <span class="text-red-900 font-semibold text-sm flex-shrink-0 text-right max-w-[55%] break-words">{{ value }}</span>
                  </div>
                </div>
                
                <!-- Map placeholder -->
                <div class="bg-red-50 rounded-xl p-6 border border-red-200 text-center">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                  </div>
                  <p class="text-red-700 font-medium mb-2">{{ $t('car_details.map_coming_soon') }}</p>
                  <p class="text-red-600 text-sm">{{ car.location || `${car.city}, ${car.canton}` }}</p>
                </div>
              </div>

              <!-- Documents Tab -->
              <div v-if="activeTab === 'documents'" class="animate-fade-in">
                <h3 class="text-base sm:text-xl font-bold text-red-900 mb-3 sm:mb-6 flex items-center">
                  <svg class="w-4 h-4 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {{ $t('car_details.documents_title') }}
                </h3>
                <div class="grid grid-cols-1 gap-1 mb-6 sm:mb-8">
                  <div v-for="(value, key) in documentInfo" :key="key" class="flex items-baseline justify-between py-2 border-b border-red-100 px-2 gap-3">
                    <span class="text-red-700 font-medium text-sm flex-1 min-w-0">{{ $t(`car_details.document_labels.${key.toLowerCase().replace(/ /g, '_')}`, key) }}</span>
                    <span class="font-semibold text-sm flex-shrink-0 text-right max-w-[55%]" :class="{
                      'text-green-600': value === $t('yes'), 
                      'text-red-600': value === $t('no'),
                      'text-red-900': value !== $t('yes') && value !== $t('no')
                    }">{{ value }}</span>
                  </div>
                </div>
                
                <!-- Typenschein Info -->
                <div v-if="car.typenscheinNr" class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 class="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    {{ $t('car_details.typenschein_title') }}
                  </h4>
                  <div class="bg-white rounded-lg p-4 border border-blue-200">
                    <p class="text-blue-800 mb-2"><strong>{{ $t('car_details.typenschein_number') }}:</strong> <code class="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono">{{ car.typenscheinNr }}</code></p>
                    <p class="text-blue-700 text-sm">{{ $t('car_details.typenschein_description') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Price & Contact (unchanged) -->
        <div class="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <!-- AUCTION LISTING -->
          <div v-if="car.listingType === 'auction' && car.status === 'active'" class="glass rounded-2xl p-3 sm:p-6 border border-red-200 shadow-lg">
            <!-- ... auction content ... -->
            <div class="text-center mb-6">
              <div class="flex items-center justify-center mb-2">
                <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                  🏆 {{ $t('auction.live_auction') }}
                </div>
                <div class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⏳ {{ timeRemaining }}
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-gray-600 text-sm">{{ $t('auction.current_bid') }}</p>
                <span class="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-800">
                  {{ $t('currency.chf') }} {{ formatNumber(car.currentBid || car.startingPrice) }}
                </span>
              </div>
              
              <!-- Reserve Price Indicator -->
              <div v-if="car.reservePrice" class="mb-4">
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm"
                  :class="isReserveMet ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  {{ $t('auction.reserve') }} {{ isReserveMet ? $t('auction.reserve_met') : $t('auction.reserve_not_met') }} ({{ $t('currency.chf') }} {{ formatNumber(car.reservePrice) }})
                </div>
              </div>
              
              <!-- Bid Count -->
              <div class="text-gray-600 text-sm mb-6">
                {{ car.bidCount || 0 }} {{ $t('auction.bids_count', car.bidCount || 0) }}
              </div>
              
              <!-- Bidding Form -->
              <div v-if="auth.user.value && car.sellerId !== auth.user.value.id" class="space-y-4">
                <!-- Check if user can bid -->
                <div v-if="!bidEligibility.canBid" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.73 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <div>
                      <p class="font-medium text-yellow-800">{{ bidEligibility.message }}</p>
                      <div v-if="bidEligibility.needsVerification" class="mt-2">
                        <button 
                          @click="requestVerification"
                          class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                        >
                          {{ $t('auction.request_verification') }}
                        </button>
                        <p class="text-yellow-700 text-xs mt-1">{{ $t('auction.verification_time') }}</p>
                      </div>
                      <div v-if="bidEligibility.userBanned" class="mt-2">
                        <NuxtLink to="/contact" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                          {{ $t('auction.contact_support') }}
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Show bid form only if user is eligible -->
                <div v-else>
                  <div class="relative">
                    <input 
                      v-model="bidAmount"
                      type="number"
                      :min="minBidAmount"
                      :step="bidIncrement"
                      class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg text-center"
                      :placeholder="$t('auction.enter_your_bid')"
                    >
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">{{ $t('currency.chf') }}</span>
                  </div>
                  
                  <!-- User funds info -->
                  <div v-if="bidEligibility.user" class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span>{{ $t('auction.your_wallet') }}:</span>
                    <span class="font-semibold text-green-600">{{ $t('currency.chf') }} {{ formatNumber(bidEligibility.user.funds) }}</span>
                  </div>
                  
                  <div class="text-sm text-gray-600">
                    <p>{{ $t('auction.minimum_bid') }}: <span class="font-semibold">{{ $t('currency.chf') }} {{ minBidAmount }}</span></p>
                    <p v-if="car.reservePrice && !isReserveMet" class="text-yellow-600">
                      {{ $t('auction.reserve_price') }}: {{ $t('currency.chf') }} {{ formatNumber(car.reservePrice) }}
                    </p>
                  </div>
                  
                  <button 
                    @click="placeBid"
                    :disabled="isPlacingBid || !bidAmount || parseFloat(bidAmount) < minBidAmount || parseFloat(bidAmount) > (bidEligibility.user?.funds || 0)"
                    class="w-full py-3 bg-gradient-to-r from-purple-600 to-red-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-red-900 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="!isPlacingBid" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                    <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {{ isPlacingBid ? $t('auction.placing_bid') : $t('auction.place_bid') }}
                  </button>
                  
                  <p v-if="bidError" class="text-red-600 text-sm text-center">{{ bidError }}</p>
                </div>
              </div>
              
              <!-- Seller View -->
              <div v-if="auth.user.value && car.sellerId === auth.user.value.id" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-2">{{ $t('auction.your_auction_dashboard') }}</h4>
                <p class="text-blue-700 text-sm mb-3">{{ $t('auction.watching_auction', { count: car.bidCount || 0 }) }}</p>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="text-center p-2 bg-white rounded-lg">
                    <p class="text-blue-700">{{ $t('auction.current_bid') }}</p>
                    <p class="font-bold text-blue-900">{{ $t('currency.chf') }} {{ formatNumber(car.currentBid || car.startingPrice) }}</p>
                  </div>
                  <div class="text-center p-2 bg-white rounded-lg">
                    <p class="text-blue-700">{{ $t('auction.time_left') }}</p>
                    <p class="font-bold text-blue-900">{{ timeRemaining }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Authentication Required Notice -->
              <div v-if="!auth.user.value" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800 text-sm text-center">
                  {{ $t('auction.login_to_bid_pre') }} <NuxtLink to="/login" class="font-semibold underline hover:text-yellow-900">{{ $t('auction.login_to_bid_link') }}</NuxtLink> {{ $t('auction.login_to_bid_post') }}
                </p>
              </div>
            </div>
          </div>

          <!-- NORMAL LISTING -->
          <div v-else class="glass rounded-2xl p-3 sm:p-6 border border-red-200 shadow-lg">
            <div class="text-center mb-4 sm:mb-6">
              <span class="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                {{ car.price ? `${$t('currency.chf')} ${formatNumber(car.price)}` : $t('car_details.price_on_request') }}
              </span>
              <div v-if="car.negotiable" class="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full ml-2 mt-2">
                {{ $t('car_details.negotiable') }}
              </div>
            </div>

            <!-- Key Specs -->
            <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.year') }}</p>
                <p class="font-semibold text-red-900">{{ car.year }}</p>
              </div>
              <div class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.mileage') }}</p>
                <p class="font-semibold text-red-900">{{ formatNumber(car.mileage) }} km</p>
              </div>
              <div class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.fuel_type') }}</p>
                <p class="font-semibold text-red-900">{{ formatFuelType(car.fuelType) }}</p>
              </div>
              <div class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.transmission') }}</p>
                <p class="font-semibold text-red-900">{{ formatTransmission(car.transmission) }}</p>
              </div>
              <div v-if="car.power || car.powerPs" class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.power') }}</p>
                <p class="font-semibold text-red-900">{{ car.power || car.powerPs }} {{ $t('power_ps') }}</p>
              </div>
              <div v-if="car.cylinders" class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('cylinders_label') }}</p>
                <p class="font-semibold text-red-900">{{ car.cylinders }}</p>
              </div>
              <div v-if="getCylinderCount" class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('cylinders_label') }}</p>
                <p class="font-semibold text-red-900">{{ getCylinderCount }}</p>
              </div>
              <div v-if="car.engineSize" class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.engine_size') }}</p>
                <p class="font-semibold text-red-900">{{ car.engineSize }}</p>
              </div>
              <div v-if="car.bodyType" class="text-center p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <p class="text-sm text-red-700">{{ $t('car_details.body_type') }}</p>
                <p class="font-semibold text-red-900">{{ formatBodyType(car.bodyType) }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button 
                @click="showContactForm = true" 
                class="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ $t('car_details.contact_seller') }}
              </button>
              
              <!-- Chat Button -->
              <button 
                @click="startChatWithSeller"
                :disabled="isCreatingChat"
                class="w-full py-3 bg-white border-2 border-red-600 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="!isCreatingChat" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                {{ isCreatingChat ? $t('car_details.starting_chat') : $t('car_details.chat_with_seller') }}
              </button>
            </div>
          </div>
          
          <!-- Bid History (for auctions) -->
          <div v-if="car.listingType === 'auction' && bidHistory.length > 0" class="glass rounded-2xl p-3 sm:p-6 border border-red-200 shadow-lg">
            <h3 class="text-base sm:text-lg font-bold text-red-900 mb-3 sm:mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              {{ $t('auction.bid_history') }}
            </h3>
            <div class="space-y-3 max-h-60 overflow-y-auto">
              <div v-for="bid in bidHistory" :key="bid.id" class="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {{ bid.userName ? bid.userName.charAt(0).toUpperCase() : $t('auction.bidder_initials') }}
                  </div>
                  <div>
                    <p class="font-medium text-red-900">{{ bid.userName || $t('auction.bidder') }}</p>
                    <p class="text-xs text-red-700">{{ formatDate(bid.createdAt) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-red-900">{{ $t('currency.chf') }} {{ formatNumber(bid.amount) }}</p>
                  <p v-if="bid.isWinning" class="text-xs text-green-600 font-semibold">{{ $t('auction.winning') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seller Information -->
          <div class="glass rounded-2xl p-3 sm:p-6 border border-red-200 shadow-lg">
            <h3 class="text-base sm:text-lg font-bold text-red-900 mb-3 sm:mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              {{ $t('car_details.seller_info') }}
            </h3>
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg">
                {{ car.sellerName ? car.sellerName.charAt(0).toUpperCase() : $t('car_details.seller_initials') }}
              </div>
              <div>
                <p class="font-semibold text-red-900">{{ car.sellerName || $t('car_details.private_seller') }}</p>
                <p class="text-sm text-red-700">{{ car.city }}, {{ car.canton }}</p>
                <p v-if="car.sellerType" class="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full inline-block mt-1">
                  {{ formatSellerType(car.sellerType) }}
                </p>
              </div>
            </div>

            <!-- Contact Info - Hidden behind button -->
            <div class="space-y-3 text-sm">
              <!-- Street Address (still visible) -->
              <div v-if="car.streetAddress" class="flex items-center text-red-700 bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <svg class="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="font-medium">{{ car.streetAddress }}, {{ car.zipCode }} {{ car.city }}</span>
              </div>
              
              <!-- Reveal Contact Info Button -->
              <div v-if="car.sellerPhone || car.sellerEmail" class="pt-2">
                <button 
                  v-if="!contactInfoRevealed"
                  @click="revealContactInfo"
                  class="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  {{ $t('car_details.reveal_contact_info') }}
                </button>
                
                <!-- Revealed Contact Info -->
                <div v-if="contactInfoRevealed" class="space-y-3 animate-fade-in">
                  <!-- Security Warning -->
                  <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                    <div class="flex items-start">
                      <svg class="w-5 h-5 text-yellow-600 mr-2 mt=0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.73 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <div>
                        <p class="font-medium text-yellow-800">{{ $t('car_details.security_notice_title') }}</p>
                        <p class="text-yellow-700 text-sm mt-1">{{ $t('car_details.security_notice_message') }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Phone Number -->
                  <div v-if="car.sellerPhone" class="flex items-center text-red-700 bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                    <svg class="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span class="font-medium">{{ car.sellerPhone }}</span>
                    <button 
                      @click="callSeller"
                      class="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {{ $t('car_details.call_seller') }}
                    </button>
                  </div>
                  
                  <!-- Email -->
                  <div v-if="car.sellerEmail" class="flex items-center text-red-700 bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                    <svg class="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span class="font-medium">{{ car.sellerEmail }}</span>
                    <a 
                      :href="`mailto:${car.sellerEmail}?subject=${encodeURIComponent($t('car_details.email_subject', { make: car.make, model: car.model, year: car.year }))}`"
                      class="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {{ $t('car_details.email') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seller's Tools Section -->
          <div v-if="auth.user.value && car.sellerId === auth.user.value.id" class="glass rounded-2xl p-6 border border-red-200 shadow-lg mt-6 relative z-10">
            <h3 class="text-lg font-bold text-red-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ $t('car_details.promote_listing_title') }}
            </h3>
            
            <div class="mb-4">
              <FeatureButton 
                :car-id="car.id"
                :is-featured="car.isFeatured"
                :featured-until="car.featuredUntil"
                :featured-days-remaining="car.featuredDaysRemaining"
              />
            </div>
            
            <div class="mt-4 text-sm text-red-700">
              <p class="mb-2 font-medium">{{ $t('car_details.promote_benefits_title') }}:</p>
              <ul class="space-y-1">
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t('car_details.benefit_priority_placement') }}
                </li>
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt=0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t('car_details.benefit_featured_badge') }}
                </li>
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt=0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t('car_details.benefit_increased_visibility') }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Shipping Ad Sidebar Version - simplified -->
          <div class="glass rounded-2xl p-4 border border-red-200 shadow-lg">
            <div class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-lg overflow-hidden border border-red-200 mb-2 bg-white">
                <img 
                  src="/assets/images/car-transport.jpeg" 
                  :alt="$t('shipping_ad.alt_text')"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h4 class="font-bold text-red-900 text-center text-sm">{{ $t('shipping_ad.title') }}</h4>
              <p class="text-red-700 text-xs font-medium text-center">{{ $t('shipping_ad.badge_text_short') }}</p>
              <p class="text-red-600 text-xs text-center mt-1">{{ $t('shipping_ad.description') }}</p>
              <p class="text-lg font-bold text-red-900 mt-2">076 448 08 49</p>
              <a :href="`https://wa.me/41764480849?text=${encodeURIComponent($t('shipping_ad.whatsapp_message', { make: car.make, model: car.model, year: car.year }))}`" 
                 target="_blank"
                 class="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all duration-200">
                <svg class="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                {{ $t('shipping_ad.sidebar_button') }}
              </a>
            </div>
          </div>

          <!-- Additional Info -->
          <div v-if="car.vin || car.firstRegistration || car.cylinders || getCylinderCount" class="glass rounded-2xl p-6 border border-red-200 shadow-lg">
            <h3 class="text-lg font-bold text-red-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ $t('car_details.vehicle_identification_title') }}
            </h3>
            <div class="space-y-3">
              <div v-if="car.vin" class="flex justify-between items-center bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <span class="text-red-700 font-medium">{{ $t('car_details.vin') }}:</span>
                <span class="text-red-900 font-mono text-sm bg-white px-2 py-1 rounded border">{{ car.vin }}</span>
              </div>
              <div v-if="car.firstRegistration" class="flex justify-between items-center bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <span class="text-red-700 font-medium">{{ $t('car_details.first_registration') }}:</span>
                <span class="text-red-900 font-semibold">{{ formatDate(car.firstRegistration) }}</span>
              </div>
              <div v-if="car.cylinders" class="flex justify-between items-center bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <span class="text-red-700 font-medium">{{ $t('cylinders_label') }}:</span>
                <span class="text-red-900 font-semibold">{{ car.cylinders }}</span>
              </div>
              <div v-if="getCylinderCount" class="flex justify-between items-center bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <span class="text-red-700 font-medium">{{ $t('cylinders_label') }}:</span>
                <span class="text-red-900 font-semibold">{{ getCylinderCount }}</span>
              </div>
              <div v-if="car.typenscheinNr" class="flex justify-between items-center bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors">
                <span class="text-red-700 font-medium">{{ $t('car_details.typenschein') }}:</span>
                <span class="text-red-900 font-mono text-sm bg-white px-2 py-1 rounded border">{{ car.typenscheinNr }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Form Modal -->
    <div v-if="showContactForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="glass rounded-2xl p-6 max-w-md w-full border border-red-200 shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-red-900">{{ $t('car_details.contact_seller') }}</h3>
          <button @click="showContactForm = false" class="text-red-700 hover:text-red-900 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="sendMessage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-red-800 mb-1">{{ $t('car_details.your_name') }}</label>
            <input v-model="contactForm.name" type="text" required class="search-input">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-red-800 mb-1">{{ $t('car_details.your_email') }}</label>
            <input v-model="contactForm.email" type="email" required class="search-input">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-red-800 mb-1">{{ $t('car_details.your_phone') }}</label>
            <input v-model="contactForm.phone" type="tel" class="search-input">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-red-800 mb-1">{{ $t('car_details.message') }}</label>
            <textarea v-model="contactForm.message" rows="4" required class="search-input"></textarea>
          </div>
          
          <button 
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200"
          >
            {{ $t('car_details.send_message') }}
          </button>
        </form>
      </div>
    </div>

    <!-- ChatSystem Modal -->
    <ChatSystem
      v-if="showChatModal && activeChatId"
      :is-open="showChatModal"
      :chat-id="activeChatId"
      @update:is-open="showChatModal = $event"
      @close="closeChatModal"
    />

    <!-- LIGHTBOX MODAL – new feature -->
    <div v-if="lightboxImage" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" @click="closeLightbox">
      <div class="relative max-w-5xl max-h-full" @click.stop>
        <img :src="lightboxImage" :alt="`${car.make} ${car.model}`" class="max-w-full max-h-screen object-contain">
        <button @click="closeLightbox" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatSystem from '~/components/ChatSystem.vue'
import FeatureButton from '~/components/FeatureButton.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const route = useRoute()
const { t } = useI18n()
const auth = useAuth()
const router = useRouter()

// State
const car = ref<any>(null)
const currentImage = ref('')
const activeTab = ref('specs')
const showContactForm = ref(false)
const error = ref(false)
const loading = ref(true)
const showChatModal = ref(false)
const activeChatId = ref<number | null>(null)
const isCreatingChat = ref(false)
const contactInfoRevealed = ref(false)

// Auction-specific state
const bidAmount = ref('')
const bidHistory = ref<any[]>([])
const isPlacingBid = ref(false)
const bidError = ref('')
const auctionTimer = ref<NodeJS.Timeout | null>(null)

// Bid eligibility state
const bidEligibility = ref({
  canBid: false,
  reason: '',
  needsVerification: false,
  userBanned: false,
  message: '',
  user: null as any
})

const isCheckingEligibility = ref(false)

// LIGHTBOX STATE
const lightboxImage = ref<string | null>(null)

// Tabs configuration with icons
const tabs = [
  { 
    id: 'specs', 
    label: t('car_details.tabs.specs') || 'Specifications',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  { 
    id: 'description', 
    label: t('car_details.tabs.description') || 'Description',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  },
  { 
    id: 'technical', 
    label: t('car_details.tabs.technical') || 'Technical',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  },
  { 
    id: 'location', 
    label: t('car_details.tabs.location') || 'Location',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  { 
    id: 'documents', 
    label: t('car_details.tabs.documents') || 'Documents',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }
]

// Fetch car data based on ID
const { data: carData, error: fetchError } = await useFetch(`/api/cars/${route.params.id}`)

if (fetchError.value) {
  error.value = true
  loading.value = false
} else {
  car.value = carData.value
  currentImage.value = car.value?.images?.[0] || '/placeholder-car.jpg'
  loading.value = false
  if (car.value && car.value.listingType === 'auction') {
    console.log('🔍 Auction car data:', {
      id: car.value.id,
      listingType: car.value.listingType,
      status: car.value.status,
      currentBid: car.value.currentBid,
      startingPrice: car.value.startingPrice,
      reservePrice: car.value.reservePrice,
      auctionEnd: car.value.auctionEnd,
      sellerId: car.value.sellerId
    })
  }
}

// Set page title
useHead({
  title: computed(() => car.value ? t('car_details.seo.title', { 
    make: car.value.make, 
    model: car.value.model, 
    year: car.value.year 
  }) || `${car.value.make} ${car.value.model} (${car.value.year}) - Swiss Car Marketplace` : 'Car Details')
})

// LIGHTBOX FUNCTIONS
const openLightbox = (img: string) => {
  lightboxImage.value = img
}
const closeLightbox = () => {
  lightboxImage.value = null
}

// Function to reveal contact information
const revealContactInfo = async () => {
  if (!auth.user.value) {
    alert(t('car_details.login_to_view_contact'))
    await router.push('/login')
    return
  }
  
  try {
    await $fetch('/api/contact/reveal', {
      method: 'POST',
      body: {
        carId: car.value.id,
        sellerId: car.value.sellerId
      }
    })
    contactInfoRevealed.value = true
  } catch (error) {
    console.error('Error logging contact view:', error)
    contactInfoRevealed.value = true
  }
}

// Helper function to get cylinder count from all possible sources
const getCylinderCount = computed(() => {
  if (!car.value) return null
  
  if (car.value.cylinders !== undefined && car.value.cylinders !== null && car.value.cylinders !== '') {
    return car.value.cylinders
  }
  
  if (car.value.typenscheinData?.BaseData_DE?.Zylinder) {
    return car.value.typenscheinData.BaseData_DE.Zylinder
  }
  
  if (car.value.typenscheinData?.Zylinder) {
    return car.value.typenscheinData.Zylinder
  }
  
  return null
})

// Format car specs for display
const carSpecs = computed(() => {
  if (!car.value) return {}
  
  const specs: Record<string, string> = {
    'Make': car.value.make,
    'Model': car.value.model,
    'Year': car.value.year.toString(),
    'Mileage': `${formatNumber(car.value.mileage)} km`,
    'Fuel Type': formatFuelType(car.value.fuelType),
    'Transmission': formatTransmission(car.value.transmission),
  }

  if (car.value.bodyType) specs['Body Type'] = formatBodyType(car.value.bodyType)
  if (car.value.driveType) specs['Drive Type'] = formatDriveType(car.value.driveType)
  if (car.value.power || car.value.powerPs) specs['Power'] = `${car.value.power || car.value.powerPs} ${t('power_ps')}`
  if (car.value.engineSize) specs['Engine Size'] = car.value.engineSize
  if (getCylinderCount.value) specs['Cylinders'] = `${getCylinderCount.value}`
  if (car.value.colorExterior) specs['Exterior Color'] = formatColor(car.value.colorExterior)
  if (car.value.colorInterior) specs['Interior Color'] = formatColor(car.value.colorInterior)
  if (car.value.condition) specs['Condition'] = formatCondition(car.value.condition)
  if (car.value.doors) specs['Doors'] = `${car.value.doors}`
  if (car.value.seats) specs['Seats'] = `${car.value.seats}`
  if (car.value.listingType) specs['Listing Type'] = car.value.listingType === 'auction' ? t('auction.listing_type') : t('car_details.fixed_price')

  return specs
})

// Technical specifications
const technicalSpecs = computed(() => {
  if (!car.value) return {}
  
  const specs: Record<string, string> = {
    'Fuel Type': formatFuelType(car.value.fuelType),
    'Transmission': formatTransmission(car.value.transmission),
  }

  if (car.value.power || car.value.powerPs) specs['Power'] = `${car.value.power || car.value.powerPs} ${t('power_ps')}`
  if (getCylinderCount.value) specs['Cylinders'] = `${getCylinderCount.value}`
  if (car.value.engineSize) specs['Engine Size'] = car.value.engineSize
  if (car.value.driveType) specs['Drive Type'] = formatDriveType(car.value.driveType)
  if (car.value.bodyType) specs['Body Type'] = formatBodyType(car.value.bodyType)
  if (car.value.condition) specs['Condition'] = formatCondition(car.value.condition)
  if (car.value.colorExterior) specs['Exterior Color'] = formatColor(car.value.colorExterior)
  if (car.value.colorInterior) specs['Interior Color'] = formatColor(car.value.colorInterior)
  if (car.value.doors) specs['Doors'] = `${car.value.doors}`
  if (car.value.seats) specs['Seats'] = `${car.value.seats}`
  if (car.value.vin) specs['VIN'] = car.value.vin
  if (car.value.firstRegistration) specs['First Registration'] = formatDate(car.value.firstRegistration)
  if (car.value.weightEmpty) specs['Empty Weight'] = `${car.value.weightEmpty} kg`
  if (car.value.weightTotal) specs['Total Weight'] = `${car.value.weightTotal} kg`
  if (car.value.listingType === 'auction') {
    specs['Listing Type'] = t('auction.listing_type')
    if (car.value.reservePrice) specs['Reserve Price'] = `${t('currency.chf')} ${formatNumber(car.value.reservePrice)}`
    if (car.value.auctionEnd) specs['Auction Ends'] = formatDate(car.value.auctionEnd)
  }
  
  return specs
})

// Location information
const locationInfo = computed(() => {
  if (!car.value) return {}
  
  const info: Record<string, string> = {}
  
  if (car.value.city) info['City'] = car.value.city
  if (car.value.canton) info['Canton'] = car.value.canton
  if (car.value.zipCode) info['ZIP Code'] = car.value.zipCode
  if (car.value.streetAddress) info['Street Address'] = car.value.streetAddress
  if (car.value.sellerType) info['Seller Type'] = formatSellerType(car.value.sellerType)
  if (car.value.sellerName) info['Contact Name'] = car.value.sellerName

  return info
})

// Document information
const documentInfo = computed(() => {
  if (!car.value) return {}
  
  const info: Record<string, string> = {}
  
  info['Valid Inspection'] = car.value.validInspection ? t('yes') : t('no')
  info['With Warranty'] = car.value.withWarranty ? t('yes') : t('no')
  info['Export Documents'] = car.value.exportDocuments ? t('yes') : t('no')
  info['Accident Vehicle'] = car.value.hasAccident ? t('yes') : t('no')
  if (car.value.typenscheinNr) info['Typenschein Available'] = t('yes')
  info['Listing Type'] = car.value.listingType === 'auction' ? t('auction.listing_type') : t('car_details.fixed_price')

  return info
})

// Contact form
const contactForm = reactive({
  name: '',
  email: '',
  phone: '',
  message: computed(() => 
    car.value ? t('car_details.default_message', {
      make: car.value.make,
      model: car.value.model,
      year: car.value.year,
      currentBid: car.value.currentBid || car.value.startingPrice,
      price: car.value.price
    }) : t('car_details.default_message_generic')
  )
})

// Computed properties for auction
const timeRemaining = computed(() => {
  if (!car.value?.auctionEnd) return t('auction.ended')
  
  const now = new Date()
  const end = new Date(car.value.auctionEnd)
  const diffMs = end.getTime() - now.getTime()
  
  if (diffMs <= 0) return t('auction.ended')
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return t('auction.time_days_hours', { days, hours })
  if (hours > 0) return t('auction.time_hours_minutes', { hours, minutes })
  return t('auction.time_minutes', { minutes })
})

const isReserveMet = computed(() => {
  if (!car.value?.reservePrice || !car.value?.currentBid) return false
  return car.value.currentBid >= car.value.reservePrice
})

const minBidAmount = computed(() => {
  const current = car.value?.currentBid || car.value?.startingPrice || 0
  const increment = Math.max(100, current * 0.05)
  return current + increment
})

const bidIncrement = computed(() => {
  const current = car.value?.currentBid || car.value?.startingPrice || 0
  return Math.max(50, current * 0.02)
})

// Fetch bid history
const loadBidHistory = async () => {
  if (!car.value || car.value.listingType !== 'auction') return
  
  try {
    console.log('🔄 Loading bid history for car:', car.value.id)
    
    const { data, error } = await useFetch(`/api/cars/${car.value.id}/bids`)
    
    console.log('📊 Full API response:', data.value)
    
    if (data.value?.success) {
      bidHistory.value = data.value.bids || []
      console.log('✅ Loaded bid history - First bid:', bidHistory.value[0])
      console.log('✅ All bids:', bidHistory.value.map(b => ({
        id: b.id,
        amount: b.amount,
        userName: b.userName,
        userId: b.userId
      })))
    } else if (error.value) {
      console.error('❌ Error fetching bid history:', error.value)
    }
  } catch (error) {
    console.error('❌ Exception loading bid history:', error)
  }
}

// Check if user can bid
const checkBidEligibility = async () => {
  bidEligibility.value = {
    canBid: false,
    reason: '',
    needsVerification: false,
    userBanned: false,
    message: '',
    user: null
  }

  if (!auth.user.value) {
    await auth.syncAuth()
    if (!auth.user.value) {
      return
    }
  }

  isCheckingEligibility.value = true
  try {
    const response = await $fetch('/api/bids/canBid')
    
    if (response.canBid) {
      bidEligibility.value = {
        canBid: true,
        reason: 'eligible',
        needsVerification: false,
        userBanned: false,
        message: t('auction.can_bid_message'),
        user: response.user
      }
    } else {
      bidEligibility.value = {
        canBid: false,
        reason: response.reason,
        needsVerification: response.needsVerification || false,
        userBanned: response.userBanned || false,
        message: response.message || t('auction.cannot_bid_message'),
        user: response.user
      }
    }
  } catch (error) {
    console.error('Error checking bid eligibility:', error)
    bidEligibility.value = {
      canBid: false,
      reason: 'error',
      needsVerification: false,
      userBanned: false,
      message: t('auction.eligibility_error'),
      user: null
    }
  } finally {
    isCheckingEligibility.value = false
  }
}

// Request verification from admin
const requestVerification = async () => {
  if (!auth.user.value) return
  
  try {
    const response = await $fetch('/api/user/request-verification', {
      method: 'POST'
    })
    
    if (response.success) {
      alert(t('auction.verification_request_sent'))
      await checkBidEligibility()
    }
  } catch (error) {
    alert(t('auction.verification_request_failed'))
  }
}

// Place bid function
const placeBid = async () => {
  if (!bidAmount.value || parseFloat(bidAmount.value) < minBidAmount.value) {
    bidError.value = t('auction.bid_too_low', { amount: minBidAmount.value })
    return
  }
  
  if (!auth.user.value) {
    alert(t('auction.login_to_place_bid'))
    await router.push('/login')
    return
  }
  
  if (parseFloat(bidAmount.value) > (bidEligibility.value.user?.funds || 0)) {
    bidError.value = t('auction.insufficient_funds')
    return
  }
  
  isPlacingBid.value = true
  bidError.value = ''
  
  try {
    const response = await $fetch('/api/bids/create', {
      method: 'POST',
      body: {
        carId: car.value.id,
        amount: parseFloat(bidAmount.value)
      }
    })
    
    if (response.success) {
      car.value.currentBid = parseFloat(bidAmount.value)
      car.value.bidCount = (car.value.bidCount || 0) + 1
      car.value.highestBidderId = auth.user.value.id
      
      bidAmount.value = ''
      
      if (bidEligibility.value.user) {
        bidEligibility.value.user.funds -= parseFloat(bidAmount.value)
      }
      
      await loadBidHistory()
      alert(t('auction.bid_placed_success'))
      await checkBidEligibility()
    }
  } catch (error: any) {
    console.error('Error placing bid:', error)
    bidError.value = error.data?.statusMessage || error.message || t('auction.bid_failed')
    
    if (error.status === 403) {
      if (error.data?.message?.includes('verified')) {
        bidEligibility.value.needsVerification = true
        bidEligibility.value.message = error.data.message
      } else if (error.data?.message?.includes('banned')) {
        bidEligibility.value.userBanned = true
        bidEligibility.value.message = error.data.message
      }
    } else if (error.status === 400) {
      if (error.data?.message?.includes('funds')) {
        bidError.value = error.data.message
        await checkBidEligibility()
      }
    }
  } finally {
    isPlacingBid.value = false
  }
}

// Start auction timer
const startAuctionTimer = () => {
  if (car.value?.listingType === 'auction' && car.value.status === 'active') {
    auctionTimer.value = setInterval(() => {}, 60000)
  }
}

// Function to start chat with seller
const startChatWithSeller = async () => {
  console.log('=== START CHAT WITH SELLER ===')
  
  if (!auth.user.value) {
    alert(t('car_details.login_to_chat'))
    await router.push('/login')
    return
  }

  if (!car.value) {
    alert(t('car_details.car_info_unavailable'))
    return
  }

  if (!car.value.sellerEmail) {
    alert(t('car_details.seller_info_unavailable'))
    return
  }

  if (auth.user.value.email === car.value.sellerEmail) {
    alert(t('car_details.cannot_message_yourself'))
    return
  }

  isCreatingChat.value = true

  try {
    console.log('Creating chat for car:', car.value.id)
    console.log('Seller email:', car.value.sellerEmail)

    const response = await $fetch('/api/chat/start', {
      method: 'POST',
      body: {
        carId: car.value.id,
        sellerEmail: car.value.sellerEmail
      }
    })

    console.log('Chat creation response:', response)

    if (response.success && response.chatId) {
      activeChatId.value = response.chatId
      showChatModal.value = true
      console.log('✅ Chat opened with ID:', activeChatId.value)
    } else {
      throw new Error('Failed to create chat - no chatId returned')
    }

  } catch (error: any) {
    console.error('❌ Chat creation error:', error)
    
    if (error.status === 404) {
      alert(t('car_details.seller_needs_account'))
    } else if (error.status === 400) {
      alert(error.data?.message || t('car_details.chat_request_failed'))
    } else {
      alert(t('car_details.chat_generic_error'))
    }
  } finally {
    isCreatingChat.value = false
  }
}

// Function to close chat modal
const closeChatModal = () => {
  showChatModal.value = false
}

// Send message via contact form
const sendMessage = () => {
  console.log('Message sent to:', car.value?.sellerEmail)
  showContactForm.value = false
  alert(t('car_details.message_sent'))
}

// Helper functions
const formatNumber = (num: any) => {
  if (num === null || num === undefined || num === '') {
    return '0'
  }
  
  let numberValue: number
  
  if (typeof num === 'object' && num !== null) {
    numberValue = parseFloat(num.toString())
  } else if (typeof num === 'string') {
    numberValue = parseFloat(num.replace(/[^\d.-]/g, ''))
  } else {
    numberValue = Number(num)
  }
  
  if (isNaN(numberValue)) {
    console.warn('formatNumber received invalid value:', num, 'type:', typeof num)
    return '0'
  }
  
  return numberValue.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const formatFuelType = (fuelType: string) => {
  const types: Record<string, string> = {
    'petrol': t('fuel_petrol'),
    'diesel': t('fuel_diesel'),
    'electric': t('fuel_electric'),
    'hybrid': t('fuel_hybrid'),
    'lpg': t('fuel_lpg'),
    'cng': t('fuel_cng')
  }
  return types[fuelType] || fuelType
}

const formatTransmission = (transmission: string) => {
  const types: Record<string, string> = {
    'manual': t('transmission_manual'),
    'automatic': t('transmission_automatic'),
    'semi_automatic': t('car_listing_form.semi_automatic')
  }
  return types[transmission] || transmission
}

const formatBodyType = (bodyType: string) => {
  const bodyTypes = [
    { value: 'sedan', label: t('car_listing_form.body_types.sedan') || 'Sedan' },
    { value: 'hatchback', label: t('car_listing_form.body_types.hatchback') || 'Hatchback' },
    { value: 'station_wagon', label: t('car_listing_form.body_types.station_wagon') || 'Station Wagon' },
    { value: 'suv', label: t('car_listing_form.body_types.suv') || 'SUV' },
    { value: 'cabriolet', label: t('car_listing_form.body_types.cabriolet') || 'Cabriolet' },
    { value: 'coupe', label: t('car_listing_form.body_types.coupe') || 'Coupé' },
    { value: 'compact', label: t('car_listing_form.body_types.compact') || 'Compact' },
    { value: 'pickup', label: t('car_listing_form.body_types.pickup') || 'Pick-up' },
    { value: 'minivan', label: t('car_listing_form.body_types.minivan') || 'Minivan' },
    { value: 'van', label: t('car_listing_form.body_types.van') || 'Van' },
    { value: 'motorcycle', label: t('car_listing_form.body_types.motorcycle') || 'Motorcycle' },
    { value: 'scooter', label: t('car_listing_form.body_types.scooter') || 'Scooter' },
    { value: 'atv', label: t('car_listing_form.body_types.atv') || 'ATV' },
    { value: 'snowmobile', label: t('car_listing_form.body_types.snowmobile') || 'Snowmobile' }
  ]
  const type = bodyTypes.find(t => t.value === bodyType)
  return type ? type.label : bodyType
}

const formatDriveType = (driveType: string) => {
  const types: Record<string, string> = {
    'fwd': t('car_listing_form.drive_types.fwd') || 'Front-wheel drive',
    'rwd': t('car_listing_form.drive_types.rwd') || 'Rear-wheel drive',
    'awd': t('car_listing_form.drive_types.awd') || 'All-wheel drive'
  }
  return types[driveType] || driveType
}

const formatCondition = (condition: string) => {
  const types: Record<string, string> = {
    'excellent': t('condition_excellent'),
    'good': t('condition_good'),
    'fair': t('condition_fair'),
    'poor': t('condition_poor')
  }
  return types[condition] || condition
}

const formatColor = (color: string) => {
  const colors = [
    { value: 'black', label: t('colors.black') || 'Black' },
    { value: 'white', label: t('colors.white') || 'White' },
    { value: 'silver', label: t('colors.silver') || 'Silver' },
    { value: 'gray', label: t('colors.gray') || 'Gray' },
    { value: 'blue', label: t('colors.blue') || 'Blue' },
    { value: 'red', label: t('colors.red') || 'Red' },
    { value: 'green', label: t('colors.green') || 'Green' },
    { value: 'brown', label: t('colors.brown') || 'Brown' },
    { value: 'beige', label: t('colors.beige') || 'Beige' }
  ]
  const colorObj = colors.find(c => c.value === color)
  return colorObj ? colorObj.label : color
}

const formatSellerType = (sellerType: string) => {
  const types: Record<string, string> = {
    'private': t('car_listing_form.seller_types.private') || 'Private Seller',
    'dealer': t('car_listing_form.seller_types.dealer') || 'Car Dealer',
    'business': t('car_listing_form.seller_types.business') || 'Business'
  }
  return types[sellerType] || sellerType
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('car_details.not_available')
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  } catch {
    return dateString
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'status-available'
    case 'auction':
      return 'status-reserved'
    case 'sold':
      return 'status-sold'
    case 'auction_ended':
      return 'status-sold'
    default:
      return 'status-available'
  }
}

const getStatusDisplay = (status: string, listingType?: string) => {
  if (listingType === 'auction') {
    switch (status?.toLowerCase()) {
      case 'active':
        return t('auction.live_auction')
      case 'auction_ended':
        return t('auction.auction_ended')
      case 'sold':
        return t('auction.auction_sold')
      default:
        return t('auction.auction')
    }
  } else {
    switch (status?.toLowerCase()) {
      case 'active':
        return t('status_active')
      case 'sold':
        return t('status_sold')
      default:
        return t('status_active')
    }
  }
}

const getFeatureLabels = () => {
  if (!car.value?.equipment) return []
  
  const equipmentFeatures = [
    { value: 'air_conditioning', label: t('equipment.air_conditioning') },
    { value: 'navigation', label: t('equipment.navigation') },
    { value: 'parking_sensors', label: t('equipment.parking_sensors') },
    { value: 'rear_camera', label: t('equipment.rear_camera') },
    { value: 'leather_seats', label: t('equipment.leather_seats') },
    { value: 'sunroof', label: t('equipment.sunroof') },
    { value: 'xenon_lights', label: t('equipment.xenon_lights') },
    { value: 'led_lights', label: t('equipment.led_lights') },
    { value: 'alloy_wheels', label: t('equipment.alloy_wheels') },
    { value: 'cruise_control', label: t('equipment.cruise_control') },
    { value: 'bluetooth', label: t('equipment.bluetooth') },
    { value: 'android_auto', label: t('equipment.android_auto') },
    { value: 'apple_carplay', label: t('equipment.apple_carplay') },
    { value: 'heated_seats', label: t('equipment.heated_seats') },
    { value: 'electric_seats', label: t('equipment.electric_seats') },
    { value: 'panorama_roof', label: t('equipment.panorama_roof') },
    { value: 'towbar', label: t('equipment.towbar') },
    { value: 'isofix', label: t('equipment.isofix') }
  ]
  
  return car.value.equipment.map((feature: string) => {
    const featureObj = equipmentFeatures.find(f => f.value === feature)
    return featureObj ? featureObj.label : feature
  })
}

const callSeller = () => {
  if (car.value?.sellerPhone) {
    window.open(`tel:${car.value.sellerPhone}`, '_self')
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (car.value?.listingType === 'auction') {
    await loadBidHistory()
    startAuctionTimer()
    
    if (auth.user.value) {
      await checkBidEligibility()
    }
  }
})

onUnmounted(() => {
  if (auctionTimer.value) {
    clearInterval(auctionTimer.value)
  }
})

// Watch auth state changes
watch(() => auth.user.value, async (newUser) => {
  if (newUser && car.value?.listingType === 'auction') {
    await checkBidEligibility()
  } else if (!newUser) {
    bidEligibility.value = {
      canBid: false,
      reason: 'not_authenticated',
      needsVerification: false,
      userBanned: false,
      message: t('auction.login_to_bid'),
      user: null
    }
  }
})
</script>

<style scoped>
.car-status {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
}

.status-available {
  @apply bg-green-100 text-green-800;
}

.status-reserved {
  @apply bg-yellow-100 text-yellow-800;
}

.status-sold {
  @apply bg-red-100 text-red-800;
}

.search-input {
  @apply w-full p-3 rounded-xl bg-white/90 border border-red-300 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200;
}

.glass {
  @apply bg-white/70 backdrop-blur-md border border-red-200;
}

/* Animation for tab content */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.25s ease-out; }

/* Hide scrollbar on tab bar */
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
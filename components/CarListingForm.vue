<template>
  <div class="min-h-screen py-8 px-4 sm:px-6">
    <!-- Header Section -->
    <div class="swiss-header rounded-2xl text-center mb-8 sm:mb-12 py-8 sm:py-12 px-4">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
        {{ $t('car_listing_form.title') }}
        <span class="text-white">
          {{ $t('car_listing_form.title_highlight') }}
        </span>
      </h1>
      <p class="text-lg sm:text-xl max-w-3xl mx-auto">
        {{ $t('car_listing_form.subtitle') }}
      </p>
    </div>

    <!-- Main Form Container -->
    <div class="swiss-form-container p-4 sm:p-6 md:p-8">
      <!-- Entry Method Selection -->
      <div v-if="currentStep === 0" class="swiss-form-section p-6 sm:p-8 text-center">
        <h2 class="text-xl sm:text-2xl font-bold text-swiss-dark mb-6">{{ $t('car_listing_form.choose_method') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <!-- Typenschein Method -->
          <div 
            @click="selectEntryMethod('typenschein')"
            class="border-2 border-gray-300 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-red-500 hover:shadow-lg transition-all duration-300"
            :class="{ 'border-red-500 bg-red-50': entryMethod === 'typenschein' }"
          >
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg class="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{{ $t('car_listing_form.with_typenschein') }}</h3>
            <p class="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{{ $t('car_listing_form.typenschein_description') }}</p>
            <ul class="text-xs sm:text-sm text-gray-500 text-left space-y-1 sm:space-y-2">
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_auto_fill') }}
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_swiss_data') }}
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_faster') }}
              </li>
            </ul>
          </div>

          <!-- Manual Method -->
          <div 
            @click="selectEntryMethod('manual')"
            class="border-2 border-gray-300 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-red-500 hover:shadow-lg transition-all duration-300"
            :class="{ 'border-red-500 bg-red-50': entryMethod === 'manual' }"
          >
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg class="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{{ $t('car_listing_form.manual_entry') }}</h3>
            <p class="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{{ $t('car_listing_form.manual_description') }}</p>
            <ul class="text-xs sm:text-sm text-gray-500 text-left space-y-1 sm:space-y-2">
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_control') }}
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_no_typenschein') }}
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('car_listing_form.benefit_custom') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Continue Button -->
        <button 
          @click="startListing"
          :disabled="!entryMethod"
          class="swiss-btn-primary px-6 py-3 sm:px-8 sm:py-4 mt-6 sm:mt-8 mx-auto text-sm sm:text-base"
          :class="{ 'opacity-50 cursor-not-allowed': !entryMethod }"
        >
          {{ $t('car_listing_form.continue_to_listing') }}
          <svg class="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Typenschein Search Step -->
      <div v-if="currentStep === 1 && entryMethod === 'typenschein'" class="swiss-form-section p-4 sm:p-6 md:p-8">
        <div class="flex items-center mb-4 sm:mb-6">
          <div class="swiss-section-icon mr-3 sm:mr-4">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.find_typenschein') }}</h3>
        </div>

        <div class="max-w-2xl mx-auto">
          <div class="form-group mb-4 sm:mb-6">
            <label class="swiss-form-label">{{ $t('car_listing_form.typenschein_number') }} *</label>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input 
                v-model="typenscheinSearch"
                type="text"
                :placeholder="$t('car_listing_form.typenschein_placeholder')"
                class="swiss-form-input p-3 flex-1 text-sm sm:text-base"
                @keyup.enter="searchTypenschein"
              >
              <button 
                @click="searchTypenschein"
                :disabled="!typenscheinSearch || searchingTypenschein"
                class="swiss-btn-primary px-4 sm:px-6 py-3 whitespace-nowrap text-sm sm:text-base"
                :class="{ 'opacity-50 cursor-not-allowed': !typenscheinSearch || searchingTypenschein }"
              >
                <span v-if="searchingTypenschein" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ $t('car_listing_form.searching') }}
                </span>
                <span v-else>{{ $t('car_listing_form.search') }}</span>
              </button>
            </div>
            <p class="text-gray-500 text-xs sm:text-sm mt-2">
              {{ $t('car_listing_form.typenschein_help') }}
            </p>
          </div>

          <!-- Search Results -->
          <div v-if="typenscheinResults" class="mt-4 sm:mt-6">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div class="flex-1">
                  <h4 class="text-base sm:text-lg font-semibold text-green-900 mb-3">
                    {{ typenscheinResults.BaseData_DE.Typenbezeichnung }}
                  </h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.vehicle_type') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Fahrzeugart }}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.body_type') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Karosserieform }}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.power') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Kw }} ({{ extractPowerPs(typenscheinResults.BaseData_DE.Kw) }} PS)</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.fuel_type') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Treibstoffcode }}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.displacement') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Ccm }} cc</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.seats') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Sitplätze }}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.drive_type') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE.Antrieb }}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-green-100">
                      <span class="text-gray-500 text-xs block">{{ $t('car_listing_form.weight') }}</span>
                      <span class="font-medium text-gray-900">{{ typenscheinResults.BaseData_DE['Leergewicht kg'] }} kg</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-green-100 p-3 rounded-lg mb-4">
                <p class="text-green-800 text-sm font-medium mb-2">{{ $t('car_listing_form.auto_fill_notification') }}</p>
                <p class="text-green-700 text-xs">{{ $t('car_listing_form.auto_fill_details') }}</p>
              </div>
              <div class="flex justify-end">
                <button 
                  @click="useTypenscheinData"
                  class="swiss-btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ $t('car_listing_form.use_data_continue') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Not Found Message -->
          <div v-if="typenscheinError" class="mt-4 sm:mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm sm:text-base">{{ typenscheinError }}</p>
            <button 
              @click="switchToManual"
              class="swiss-btn-secondary px-4 py-2 mt-2 text-sm"
            >
              {{ $t('car_listing_form.switch_to_manual') }}
            </button>
          </div>

          <!-- Manual Fallback -->
          <div class="mt-6 pt-6 border-t border-gray-200 text-center">
            <p class="text-gray-600 mb-4 text-sm sm:text-base">{{ $t('car_listing_form.cant_find_typenschein') }}</p>
            <button 
              @click="switchToManual"
              class="swiss-btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              {{ $t('car_listing_form.enter_details_manually') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div v-if="currentStep > (entryMethod === 'typenschein' ? 1 : 0)" class="mb-6 sm:mb-8">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <span class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('car_listing_form.progress') }}</span>
          <span class="text-xs sm:text-sm font-medium text-swiss-red">{{ Math.min(Math.round(formProgress), 100) }}% {{ $t('car_listing_form.complete') }}</span>
        </div>
        <div class="swiss-progress-bar">
          <div class="swiss-progress-fill" :style="{ width: Math.min(formProgress, 100) + '%' }"></div>
        </div>
        
        <div class="flex justify-between mt-4 sm:mt-6">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="flex flex-col items-center flex-1"
          >
            <div 
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 mb-1 sm:mb-2"
              :class="getStepClass(step.id)"
            >
              {{ step.id < currentMainStep ? '✓' : step.id }}
            </div>
            <span class="text-xs text-center hidden xs:block" :class="getStepTextClass(step.id)">
              {{ $t(`car_listing_form.steps.${step.id}`) || step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Listing Type Selection -->
      <div v-if="currentStep === (entryMethod === 'typenschein' ? 2 : 1)" class="swiss-form-section p-6 sm:p-8">
        <div class="flex items-center mb-6">
          <div class="swiss-section-icon mr-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.choose_listing_type') }}</h3>
        </div>
        
        <div v-if="userData" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-blue-900">{{ $t('car_listing_form.your_balance') }}</h4>
              <p class="text-blue-700 text-lg font-bold">{{ userData.funds || 0 }} {{ $t('currency.chf') }}</p>
              <p class="text-blue-600 text-sm mt-1">
                {{ userJoinedDays > 180 ? $t('car_listing_form.standard_fees') : $t('car_listing_form.free_listings', { days: 180 - userJoinedDays }) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-blue-600 text-sm">{{ $t('car_listing_form.member_since', { date: formattedUserJoinDate }) }}</p>
              <p class="text-blue-500 text-xs">{{ $t('car_listing_form.account_type', { type: $t(`profile.role.${userData.role === 'seller' ? 'verified_seller' : 'registered_buyer'}`) }) }}</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <!-- Normal Listing -->
          <div 
            @click="selectListingType('normal')"
            class="border-2 border-gray-300 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-300"
            :class="{ 'border-green-500 bg-green-50': form.listingType === 'normal' }"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div v-if="userJoinedDays > 180" class="text-lg font-bold text-green-700">7.5 {{ $t('currency.chf') }}</div>
                <div v-else class="text-lg font-bold text-green-700">{{ $t('car_listing_form.free') }}</div>
                <div class="text-sm text-gray-500">{{ $t('car_listing_form.one_time_fee') }}</div>
              </div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{{ $t('car_listing_form.normal_listing') }}</h3>
            <p class="text-gray-600 mb-4 text-sm sm:text-base">{{ $t('car_listing_form.normal_description') }}</p>
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center"><svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_fixed_price') }}</li>
              <li class="flex items-center"><svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_direct_contact') }}</li>
              <li class="flex items-center"><svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_30_days') }}</li>
            </ul>
            <div v-if="form.listingType === 'normal'" class="mt-4 p-3 bg-green-100 rounded-lg">
              <p class="text-green-800 text-sm font-medium">{{ userJoinedDays > 180 ? $t('car_listing_form.fee_normal', { amount: 7.5 }) : $t('car_listing_form.free_period') }}</p>
            </div>
          </div>

          <!-- Auction Listing -->
          <div 
            @click="selectListingType('auction')"
            class="border-2 border-gray-300 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all duration-300"
            :class="{ 'border-purple-500 bg-purple-50': form.listingType === 'auction' }"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div v-if="userJoinedDays > 180" class="text-lg font-bold text-purple-700">10 {{ $t('currency.chf') }}</div>
                <div v-else class="text-lg font-bold text-purple-700">{{ $t('car_listing_form.free') }}</div>
                <div class="text-sm text-gray-500">{{ $t('car_listing_form.one_time_fee') }}</div>
              </div>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{{ $t('car_listing_form.auction_listing') }}</h3>
            <p class="text-gray-600 mb-4 text-sm sm:text-base">{{ $t('car_listing_form.auction_description') }}</p>
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center"><svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_bidding') }}</li>
              <li class="flex items-center"><svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_set_prices') }}</li>
              <li class="flex items-center"><svg class="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>{{ $t('car_listing_form.benefit_7_days') }}</li>
            </ul>
            <div v-if="form.listingType === 'auction'" class="mt-4 p-3 bg-purple-100 rounded-lg">
              <p class="text-purple-800 text-sm font-medium">{{ userJoinedDays > 180 ? $t('car_listing_form.fee_auction', { amount: 10 }) : $t('car_listing_form.free_period') }}</p>
            </div>
          </div>
        </div>

        <div v-if="showInsufficientFundsWarning" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h4 class="font-semibold text-red-900">{{ $t('car_listing_form.insufficient_funds') }}</h4>
              <p class="text-red-700 text-sm mt-1">{{ $t('car_listing_form.funds_needed', { required: requiredFee, balance: userData.funds || 0 }) }}</p>
              <NuxtLink to="/profile" class="text-red-800 hover:underline text-sm font-medium mt-2 inline-block">{{ $t('car_listing_form.add_funds') }}</NuxtLink>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button @click="previousStep" type="button" class="swiss-btn-secondary px-6 py-3">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            {{ $t('car_listing_form.back') }}
          </button>
          <button @click="nextStep" :disabled="!canProceedListingType" type="button" class="swiss-btn-primary px-6 py-3" :class="{ 'opacity-50 cursor-not-allowed': !canProceedListingType }">
            {{ $t('car_listing_form.continue_to_details') }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <!-- SIMPLIFIED VERSION: Main Form Steps -->
      <div v-if="shouldShowMainForm" class="space-y-6 sm:space-y-8">
        <!-- Step 1: Basic Information -->
        <div v-if="currentMainStep === 1" class="swiss-form-section p-4 sm:p-6">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="swiss-section-icon mr-3 sm:mr-4">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.vehicle_info') }}</h3>
          </div>
          
          <div v-if="entryMethod === 'typenschein' && typenscheinResults" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center"><svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><h4 class="font-semibold text-green-900 text-sm sm:text-base">{{ $t('car_listing_form.auto_filled_notification') }}</h4></div>
            <p class="text-green-700 text-xs sm:text-sm mt-1">{{ $t('car_listing_form.auto_filled_details') }}</p>
            <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
              <div v-if="form.make" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.make') }}: {{ form.make }}</span></div>
              <div v-if="form.model" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.model') }}: {{ form.model }}</span></div>
              <div v-if="form.fuelType" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.fuel_type') }}: {{ formatFuelTypeDisplay(form.fuelType) }}</span></div>
              <div v-if="form.power" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.power') }}: {{ form.power }} PS</span></div>
              <div v-if="form.bodyType" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.body_type') }}: {{ formatBodyTypeDisplay(form.bodyType) }}</span></div>
              <div v-if="form.engineSize" class="flex items-center"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">{{ $t('car_listing_form.engine_size') }}: {{ form.engineSize }}</span></div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.make') }} *</label>
              <div class="relative">
                <select v-model="form.make" @change="onMakeChange" required class="swiss-form-input p-3 text-sm sm:text-base">
                  <option value="">{{ $t('car_listing_form.select_make') }}</option>
                  <option v-for="make in carMakes" :key="make" :value="make">{{ make }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.model') }} *</label>
              <div class="relative">
                <select v-if="filteredModels.length > 0 && !form.model" v-model="form.model" required class="swiss-form-input p-3 text-sm sm:text-base">
                  <option value="">{{ $t('car_listing_form.select_model') }}</option>
                  <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
                </select>
                <input v-else v-model="form.model" type="text" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="filteredModels.length > 0 ? $t('car_listing_form.type_custom_model') : $t('car_listing_form.enter_model')" @focus="showModelDropdown = false">
              </div>
              <p v-if="filteredModels.length > 0 && !form.model" class="text-gray-500 text-xs mt-1">{{ $t('car_listing_form.select_or_type') }}</p>
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.year') }} *</label>
              <select v-model="form.year" required class="swiss-form-input p-3 text-sm sm:text-base">
                <option value="">{{ $t('car_listing_form.select_year') }}</option>
                <option v-for="year in allYears" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div v-if="form.listingType === 'auction'" class="form-group">
              <label class="swiss-form-label">{{ $t('auction.starting_price') }} *</label>
              <div class="relative"><input v-model="form.startingPrice" type="number" required class="swiss-form-input p-3 pl-12 text-sm sm:text-base w-full" :placeholder="$t('car_listing_form.enter_starting_price')" min="0" step="100"><span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm pointer-events-none">{{ $t('currency.chf') }}</span></div>
              <p class="text-gray-500 text-xs mt-1">{{ $t('car_listing_form.starting_price_help') }}</p>
            </div>
            <div v-else class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.export_price') }} *</label>
              <div class="relative"><input v-model="form.price" type="number" required class="swiss-form-input p-3 pl-12 text-sm sm:text-base w-full" :placeholder="$t('car_listing_form.enter_price')" min="0" step="100"><span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm pointer-events-none">{{ $t('currency.chf') }}</span></div>
              <p class="text-gray-500 text-xs mt-1">{{ $t('car_listing_form.price_in_chf') }}</p>
            </div>
            <div v-if="form.listingType === 'auction'" class="form-group">
              <label class="swiss-form-label">{{ $t('auction.reserve_price') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label>
              <div class="relative"><input v-model="form.reservePrice" type="number" class="swiss-form-input p-3 pl-12 text-sm sm:text-base w-full" :placeholder="$t('car_listing_form.optional_minimum')" min="0" step="100"><span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm pointer-events-none">{{ $t('currency.chf') }}</span></div>
              <p class="text-gray-500 text-xs mt-1">{{ $t('car_listing_form.reserve_price_help') }}</p>
            </div>
            <div v-if="form.listingType === 'auction'" class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.auction_duration') || 'Auction Duration (days)' }}</label>
              <input v-model="form.auctionDurationDays" type="number" min="1" max="90" class="swiss-form-input p-3 text-sm sm:text-base w-full" placeholder="7" />
              <p class="text-gray-500 text-xs mt-1">{{ $t('car_listing_form.auction_duration_help') || 'How many days should the auction run? Default is 7 days.' }}</p>
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.mileage') }} *</label>
              <input v-model="form.mileage" type="number" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.mileage_placeholder')" min="0">
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.fuel_type') }} *</label>
              <select v-model="form.fuelType" required class="swiss-form-input p-3 text-sm sm:text-base">
                <option value="">{{ $t('car_listing_form.select_fuel') }}</option>
                <option v-for="fuel in fuelTypes" :key="fuel.value" :value="fuel.value">{{ $t(`fuel_${fuel.value}`) || fuel.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.transmission') }} *</label>
              <select v-model="form.transmission" required class="swiss-form-input p-3 text-sm sm:text-base">
                <option value="">{{ $t('car_listing_form.select_transmission') }}</option>
                <option v-for="transmission in transmissionTypes" :key="transmission.value" :value="transmission.value">{{ $t(`transmission_${transmission.value}`) || transmission.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="swiss-form-label">{{ $t('car_listing_form.body_type') }} *</label>
              <select v-model="form.bodyType" required class="swiss-form-input p-3 text-sm sm:text-base">
                <option value="">{{ $t('car_listing_form.select_body') }}</option>
                <option v-for="type in bodyTypes" :key="type.value" :value="type.value">{{ $t(`car_listing_form.body_types.${type.value}`) || type.label }}</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button @click="previousMainStep" type="button" class="swiss-btn-secondary px-6 py-3"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>{{ $t('car_listing_form.back') }}</button>
            <button @click="nextMainStep" :disabled="!canProceedBasicInfo" type="button" class="swiss-btn-primary px-6 py-3" :class="{ 'opacity-50 cursor-not-allowed': !canProceedBasicInfo }">{{ $t('car_listing_form.continue_to_technical') }}<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
        </div>

        <!-- Step 2: Technical Details -->
        <div v-if="currentMainStep === 2" class="swiss-form-section p-4 sm:p-6">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="swiss-section-icon mr-3 sm:mr-4"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>
            <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.technical_details') }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.power_ps') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><input v-model="form.power" type="number" class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.enter_power')" min="0"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.cylinders') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.cylinders" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_cylinders') }}</option><option value="1">{{ $t('car_listing_form.cylinder_single') }}</option><option value="2">{{ $t('car_listing_form.cylinders', { count: 2 }) }}</option><option value="3">{{ $t('car_listing_form.cylinders', { count: 3 }) }}</option><option value="4">{{ $t('car_listing_form.cylinders', { count: 4 }) }}</option><option value="5">{{ $t('car_listing_form.cylinders', { count: 5 }) }}</option><option value="6">{{ $t('car_listing_form.cylinders', { count: 6 }) }}</option><option value="8">{{ $t('car_listing_form.cylinders', { count: 8 }) }}</option><option value="10">{{ $t('car_listing_form.cylinders', { count: 10 }) }}</option><option value="12">{{ $t('car_listing_form.cylinders', { count: 12 }) }}</option><option value="16">{{ $t('car_listing_form.cylinders', { count: 16 }) }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.drive_type') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.driveType" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_drive_type') }}</option><option v-for="type in driveTypes" :key="type.value" :value="type.value">{{ $t(`car_listing_form.drive_types.${type.value}`) || type.label }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.engine_size') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><input v-model="form.engineSize" type="text" class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.engine_size_placeholder')"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.exterior_color') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.colorExterior" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_color') }}</option><option v-for="color in exteriorColors" :key="color.value" :value="color.value">{{ $t(`colors.${color.value}`) || color.label }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.interior_color') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.colorInterior" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_color') }}</option><option v-for="color in interiorColors" :key="color.value" :value="color.value">{{ $t(`colors.${color.value}`) || color.label }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.condition') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.condition" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_condition') }}</option><option v-for="condition in conditions" :key="condition.value" :value="condition.value">{{ $t(`condition_${condition.value}`) || condition.label }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.number_of_doors') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.doors" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_doors') }}</option><option v-for="door in doorOptions" :key="door" :value="door">{{ door }} {{ $t('car_listing_form.doors') }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.number_of_seats') }} <span class="text-gray-500 text-xs">{{ $t('car_listing_form.optional') }}</span></label><select v-model="form.seats" class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_seats') }}</option><option v-for="seat in seatOptions" :key="seat" :value="seat">{{ seat }} {{ $t('car_listing_form.seats') }}</option></select></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.vin') }}</label><input v-model="form.vin" type="text" class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.enter_vin')" maxlength="17"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.first_registration') }}</label><input v-model="form.firstRegistration" type="month" class="swiss-form-input p-3 text-sm sm:text-base"></div>
          </div>
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button @click="previousMainStep" type="button" class="swiss-btn-secondary px-6 py-3"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>{{ $t('car_listing_form.back') }}</button>
            <button @click="nextMainStep" :disabled="!canProceedTechnical" type="button" class="swiss-btn-primary px-6 py-3" :class="{ 'opacity-50 cursor-not-allowed': !canProceedTechnical }">{{ $t('car_listing_form.continue_to_features') }}<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
        </div>

        <!-- Step 3: Equipment & Features -->
        <div v-if="currentMainStep === 3" class="swiss-form-section p-4 sm:p-6">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="swiss-section-icon mr-3 sm:mr-4"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
            <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.equipment_features') }}</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <label v-for="feature in equipmentFeatures" :key="feature.value" class="flex items-center p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <input type="checkbox" v-model="form.equipment" :value="feature.value" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 flex-shrink-0">
              <span class="ml-2 text-gray-700 text-xs sm:text-sm break-words leading-tight">{{ $t(`equipment.${feature.value}`) || feature.label }}</span>
            </label>
          </div>
          <div class="mt-4 sm:mt-6">
            <label class="swiss-form-label">{{ $t('car_listing_form.additional_features') }}</label>
            <textarea v-model="form.additionalFeatures" :placeholder="$t('car_listing_form.features_placeholder')" class="swiss-form-input p-3 h-20 sm:h-24 resize-none text-sm sm:text-base" rows="3"></textarea>
          </div>
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button @click="previousMainStep" type="button" class="swiss-btn-secondary px-6 py-3"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>{{ $t('car_listing_form.back') }}</button>
            <button @click="nextMainStep" type="button" class="swiss-btn-primary px-6 py-3">{{ $t('car_listing_form.continue_to_location') }}<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
        </div>

        <!-- Step 4: Location & Contact -->
        <div v-if="currentMainStep === 4" class="swiss-form-section p-4 sm:p-6">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="swiss-section-icon mr-3 sm:mr-4"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
            <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.location_contact') }}</h3>
          </div>
          <div v-if="userData" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"><div class="flex items-center"><svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div><h4 class="font-semibold text-green-900 text-base">{{ $t('car_listing_form.using_registered_info') }}</h4><p class="text-green-700 text-sm mt-1">{{ $t('car_listing_form.contact_info', { name: userData.name, email: userData.email, phone: userData.phone }) }}</p><p class="text-green-600 text-xs mt-1">{{ $t('car_listing_form.location_info', { street: userData.streetAddress, zip: userData.zipCode, city: userData.city, canton: userData.canton }) }}</p></div></div></div>
          <div v-else-if="userLoading" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><div class="flex items-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-blue-800 text-sm font-medium">{{ $t('car_listing_form.loading_info') }}</span></div></div>
          <div v-else class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><div class="flex items-center"><svg class="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg><div><h4 class="font-semibold text-yellow-900 text-base">{{ $t('car_listing_form.manual_entry_required') }}</h4><p class="text-yellow-700 text-sm mt-1">{{ $t('car_listing_form.could_not_load_info') }}</p></div></div></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.canton') }} *</label><select v-model="form.canton" required class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_canton') }}</option><option v-for="canton in cantons" :key="canton" :value="canton">{{ canton }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.street_address') }}</label><input v-model="form.streetAddress" type="text" class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.street_address_placeholder')"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.city') }} *</label><input v-model="form.city" type="text" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.city_placeholder')"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.zip_code') }} *</label><input v-model="form.zipCode" type="text" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.zip_code_placeholder')" pattern="[0-9]{4}" maxlength="4"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.seller_type') }} *</label><select v-model="form.sellerType" required class="swiss-form-input p-3 text-sm sm:text-base"><option value="">{{ $t('car_listing_form.select_type') }}</option><option value="private">{{ $t('car_listing_form.seller_types.private') }}</option><option value="dealer">{{ $t('car_listing_form.seller_types.dealer') }}</option><option value="business">{{ $t('car_listing_form.seller_types.business') }}</option></select></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.contact_name') }} *</label><input v-model="form.sellerName" type="text" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.name_placeholder')"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.phone') }} *</label><input v-model="form.sellerPhone" type="tel" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.phone_placeholder')"></div>
            <div class="form-group"><label class="swiss-form-label">{{ $t('car_listing_form.email') }} *</label><input v-model="form.sellerEmail" type="email" required class="swiss-form-input p-3 text-sm sm:text-base" :placeholder="$t('car_listing_form.email_placeholder')"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <label class="flex items-center"><input type="checkbox" v-model="form.exportDocuments" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"><span class="ml-2 sm:ml-3 text-gray-700 text-sm">{{ $t('car_listing_form.export_documents_available') }}</span></label>
            <label class="flex items-center"><input type="checkbox" v-model="form.withWarranty" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"><span class="ml-2 sm:ml-3 text-gray-700 text-sm">{{ $t('car_listing_form.with_warranty') }}</span></label>
            <label class="flex items-center"><input type="checkbox" v-model="form.validInspection" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"><span class="ml-2 sm:ml-3 text-gray-700 text-sm">{{ $t('car_listing_form.valid_inspection') }}</span></label>
            <label class="flex items-center"><input type="checkbox" v-model="form.hasAccident" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"><span class="ml-2 sm:ml-3 text-gray-700 text-sm">{{ $t('car_listing_form.accident_vehicle') }}</span></label>
          </div>
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button @click="previousMainStep" type="button" class="swiss-btn-secondary px-6 py-3"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>{{ $t('car_listing_form.back') }}</button>
            <button @click="nextMainStep" :disabled="!canProceedLocation" type="button" class="swiss-btn-primary px-6 py-3" :class="{ 'opacity-50 cursor-not-allowed': !canProceedLocation }">{{ $t('car_listing_form.continue_to_photos') }}<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
        </div>

        <!-- Step 5: Photos & Description -->
        <div v-if="currentMainStep === 5" class="swiss-form-section p-4 sm:p-6">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="swiss-section-icon mr-3 sm:mr-4"><svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
            <h3 class="text-lg sm:text-xl font-bold text-swiss-dark">{{ $t('car_listing_form.photos_description') }}</h3>
          </div>
          <div class="mb-4 sm:mb-6">
            <label class="swiss-form-label">{{ $t('car_listing_form.photos') }} <span class="text-xs sm:text-sm text-gray-500">{{ $t('car_listing_form.photos_optional') }}</span></label>
            <div @click="triggerFileInput" class="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-8 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
              <svg class="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-gray-700 font-medium text-sm sm:text-base">{{ $t('car_listing_form.click_to_upload') }}</p>
              <p class="text-gray-500 text-xs sm:text-sm mt-1">{{ $t('car_listing_form.drag_and_drop') }}</p>
              <p class="text-gray-400 text-xs mt-2">{{ $t('car_listing_form.file_requirements') }}</p>
              <p class="text-blue-500 text-xs mt-2 font-medium">{{ $t('car_listing_form.photos_optional_dev') }}</p>
            </div>
            <input ref="fileInput" type="file" multiple accept="image/*" @change="handleImageUpload" class="hidden">
            <div v-if="uploadingImages" class="mt-3 mb-2"><div class="flex items-center gap-2 text-sm text-gray-600 mb-1"><div class="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>Uploading images... {{ uploadProgress }}%</div><div class="w-full bg-gray-200 rounded-full h-1.5"><div class="bg-red-600 h-1.5 rounded-full transition-all" :style="{ width: uploadProgress + '%' }"></div></div></div>
            <div v-if="form.images.length > 0" class="mt-4"><div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4"><div v-for="(image, index) in form.images" :key="index" class="relative group"><img :src="image.url" :alt="`Car image ${index + 1}`" class="w-full h-20 sm:h-24 object-cover rounded-lg" :class="{ 'opacity-50': image.uploading }" loading="lazy" decoding="async"><div v-if="image.uploading" class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg"><div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div><div v-if="image.error" class="absolute inset-0 flex items-center justify-center bg-red-500/60 rounded-lg"><span class="text-white text-xs font-bold">Failed</span></div><button @click="removeImage(index)" class="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors">×</button></div></div><p class="text-gray-600 text-xs sm:text-sm mt-2">{{ form.images.filter(img => !img.error && !img.uploading).length }} / {{ form.images.length }} photos uploaded</p></div>
          </div>
          <div>
            <label class="swiss-form-label">{{ $t('car_listing_form.description') }} *</label>
            <textarea v-model="form.description" :placeholder="$t('car_listing_form.description_placeholder')" class="swiss-form-input p-3 h-32 sm:h-40 resize-none text-sm sm:text-base" rows="6" required @input="validateDescription"></textarea>
            <p class="text-gray-500 text-xs mt-1" :class="{ 'text-red-500': form.description.length < 50 }">{{ $t('car_listing_form.minimum_characters', { current: form.description.length, required: 50 }) }}</p>
          </div>
          <div class="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <label class="flex items-start"><input type="checkbox" v-model="form.acceptedTerms" class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"><span class="ml-2 sm:ml-3 text-gray-700 text-xs sm:text-sm">{{ $t('car_listing_form.accept_terms') }} <a href="/terms" class="text-red-600 hover:underline">{{ $t('car_listing_form.terms_and_conditions') }}</a> {{ $t('car_listing_form.confirm_accuracy') }}</span></label>
          </div>
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button @click="previousMainStep" type="button" class="swiss-btn-secondary px-6 py-3"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>{{ $t('car_listing_form.back') }}</button>
            <button @click="submitListing" :disabled="!isFinalStepValid || isSubmitting || listingFeeCheckFailed" class="swiss-btn-primary px-6 py-3" :class="{ 'opacity-50 cursor-not-allowed': !isFinalStepValid || isSubmitting || listingFeeCheckFailed }">
              <span v-if="isSubmitting" class="flex items-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{{ $t('car_listing_form.publishing') }}</span>
              <span v-else-if="listingFeeCheckFailed">{{ $t('car_listing_form.insufficient_funds') }}</span>
              <span v-else>{{ userJoinedDays > 180 ? $t('car_listing_form.publish_with_fee', { fee: listingFee }) : $t('car_listing_form.publish_free_listing') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { carMakes, makeModels } from '~/constants/carData'

const { t } = useI18n()

// Form state
const uploadingImages = ref(false)
const uploadProgress = ref(0)
const currentStep = ref(0)
const entryMethod = ref<'typenschein' | 'manual' | null>(null)
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const userData = ref<any>(null)
const userLoading = ref(true)
const showModelDropdown = ref(true)
const listingFeeCheckFailed = ref(false)

// Typenschein search
const typenscheinSearch = ref('')
const searchingTypenschein = ref(false)
const typenscheinResults = ref<any>(null)
const typenscheinError = ref<string | null>(null)

// Steps configuration
const steps = [
  { id: 1, label: t('car_listing_form.steps.1') || 'Listing Type' },
  { id: 2, label: t('car_listing_form.steps.2') || 'Basic Info' },
  { id: 3, label: t('car_listing_form.steps.3') || 'Technical' },
  { id: 4, label: t('car_listing_form.steps.4') || 'Features' },
  { id: 5, label: t('car_listing_form.steps.5') || 'Location' },
  { id: 6, label: t('car_listing_form.steps.6') || 'Photos' }
]

// Form data with auction fields
const form = ref({
  listingType: 'normal',
  startingPrice: '',
  reservePrice: '',
  auctionDurationDays: 7,
  make: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  fuelType: '',
  transmission: '',
  bodyType: '',
  power: '',
  cylinders: '',
  driveType: '',
  engineSize: '',
  doors: '',
  seats: '',
  colorExterior: '',
  colorInterior: '',
  condition: '',
  vin: '',
  firstRegistration: '',
  equipment: [] as string[],
  additionalFeatures: '',
  canton: '',
  city: '',
  zipCode: '',
  streetAddress: '',
  sellerType: '',
  sellerName: '',
  sellerPhone: '',
  sellerEmail: '',
  exportDocuments: false,
  withWarranty: false,
  validInspection: false,
  hasAccident: false,
  images: [] as Array<{ url: string; uploading: boolean; error: boolean }>,
  description: '',
  acceptedTerms: false,
  typenscheinNr: '',
  displacement: '',
  weightEmpty: '',
  weightTotal: '',
  vehicleType: ''
})

// Computed properties
const filteredModels = computed(() => {
  return makeModels[form.value.make] || []
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)
})

const allYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
})

const userJoinedDays = computed(() => {
  if (!userData.value?.createdAt) return 0
  const joinedDate = new Date(userData.value.createdAt)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - joinedDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const formattedUserJoinDate = computed(() => {
  if (!userData.value?.createdAt) return t('car_listing_form.unknown_date') || 'Unknown'
  return new Date(userData.value.createdAt).toLocaleDateString()
})

const listingFee = computed(() => {
  if (userJoinedDays.value > 180) {
    return form.value.listingType === 'auction' ? 10 : 7.5
  }
  return 0
})

const requiredFee = computed(() => {
  return form.value.listingType === 'auction' ? 10 : 7.5
})

const showInsufficientFundsWarning = computed(() => {
  if (!userData.value || userJoinedDays.value <= 180) return false
  const userBalance = userData.value.funds || 0
  return userBalance < requiredFee.value
})

const shouldShowMainForm = computed(() => {
  if (entryMethod.value === 'typenschein') {
    return currentStep.value > 2
  }
  return currentStep.value > 1
})

const currentMainStep = computed(() => {
  if (entryMethod.value === 'typenschein') {
    return currentStep.value - 2
  }
  return currentStep.value - 1
})

const formProgress = computed(() => {
  const totalSteps = (entryMethod.value === 'typenschein' ? steps.length + 2 : steps.length + 1)
  const baseProgress = ((currentStep.value) / totalSteps) * 100
  
  if (currentStep.value === 0 || 
      (entryMethod.value === 'typenschein' && currentStep.value === 1) ||
      currentStep.value === (entryMethod.value === 'typenschein' ? 2 : 1)) {
    return baseProgress
  }
  
  let currentStepProgress = 0
  const mainStep = currentMainStep.value
  
  switch (mainStep) {
    case 1:
      if (form.value.listingType === 'auction') {
        const completedFields = getCompletedFields(['make', 'model', 'year', 'startingPrice', 'mileage', 'fuelType', 'transmission', 'bodyType'])
        currentStepProgress = (completedFields / 8) * 20
      } else {
        const completedFields = getCompletedFields(['make', 'model', 'year', 'price', 'mileage', 'fuelType', 'transmission', 'bodyType'])
        currentStepProgress = (completedFields / 8) * 20
      }
      break
    case 2:
      currentStepProgress = (getCompletedFields(['power', 'driveType', 'colorExterior', 'condition']) / 4) * 20
      break
    case 3:
      currentStepProgress = 20
      break
    case 4:
      currentStepProgress = (getCompletedFields(['canton', 'city', 'zipCode', 'sellerType', 'sellerName', 'sellerPhone', 'sellerEmail']) / 7) * 20
      break
    case 5:
      const descriptionComplete = form.value.description.length >= 50 ? 1 : 0
      const termsComplete = form.value.acceptedTerms ? 1 : 0
      currentStepProgress = ((descriptionComplete + termsComplete) / 2) * 20
      break
  }
  
  return Math.min(baseProgress + currentStepProgress, 100)
})

const getCompletedFields = (fields: string[]) => {
  return fields.filter(field => {
    const value = form.value[field as keyof typeof form.value]
    return value !== null && value !== undefined && value !== ''
  }).length
}

const canProceedListingType = computed(() => {
  if (!form.value.listingType) return false
  if (userLoading.value) return true
  if (userJoinedDays.value > 180 && userData.value) {
    const userBalance = userData.value.funds || 0
    const required = form.value.listingType === 'auction' ? 10 : 7.5
    return userBalance >= required
  }
  return true
})

const canProceedBasicInfo = computed(() => {
  if (form.value.listingType === 'auction') {
    return !!(form.value.make && form.value.model && form.value.year && 
             form.value.startingPrice && form.value.mileage && form.value.fuelType && 
             form.value.transmission && form.value.bodyType)
  } else {
    return !!(form.value.make && form.value.model && form.value.year && 
             form.value.price && form.value.mileage && form.value.fuelType && 
             form.value.transmission && form.value.bodyType)
  }
})

const canProceedTechnical = computed(() => {
  // All technical fields are now optional - users can proceed without filling them
  return true
})

const canProceedLocation = computed(() => {
  return !!(form.value.canton && form.value.city && form.value.zipCode && 
           form.value.sellerType && form.value.sellerName && 
           form.value.sellerPhone && form.value.sellerEmail)
})

const isFinalStepValid = computed(() => {
  return form.value.acceptedTerms
})

// Methods
const selectEntryMethod = (method: 'typenschein' | 'manual') => {
  entryMethod.value = method
}

const startListing = () => {
  if (entryMethod.value === 'typenschein') {
    currentStep.value = 1
  } else {
    currentStep.value = 1
  }
}

const selectListingType = (type: 'normal' | 'auction') => {
  form.value.listingType = type
  if (type === 'auction') {
    form.value.price = ''
    form.value.startingPrice = ''
    form.value.reservePrice = ''
  } else {
    form.value.startingPrice = ''
    form.value.reservePrice = ''
  }
}

const searchTypenschein = async () => {
  if (!typenscheinSearch.value.trim()) return
  
  searchingTypenschein.value = true
  typenscheinError.value = null
  typenscheinResults.value = null
  
  const searchTerm = typenscheinSearch.value.trim().toUpperCase()
  
  try {
    const { data, error } = await useFetch(`/api/typenschein/${searchTerm}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (error.value) {
      typenscheinError.value = t('car_listing_form.typenschein_not_found') || 'Typenschein not found. Please check the number and try again.'
      return
    }

    if (data.value) {
      typenscheinResults.value = data.value
    } else {
      typenscheinError.value = t('car_listing_form.no_data_found') || 'No data found for this Typenschein number.'
    }
  } catch (error) {
    console.error('Error searching typenschein:', error)
    typenscheinError.value = t('car_listing_form.search_error') || 'An error occurred while searching. Please try again.'
  } finally {
    searchingTypenschein.value = false
  }
}

const extractPowerPs = (kwString: string) => {
  const match = kwString.match(/\((\d+) PS\)/)
  return match ? match[1] : ''
}

const useTypenscheinData = () => {
  if (!typenscheinResults.value) return
  
  const data = typenscheinResults.value.BaseData_DE
  console.log('🔧 Auto-filling form with Typenschein data:', data)

  const typeName = data.Typenbezeichnung || ''
  const vehicleType = data.Fahrzeugart || ''
  let make = ''
  let model = typeName
  
  const detectSpecialVehicle = (typeName, vehicleType) => {
    const lowerTypeName = typeName.toLowerCase()
    const lowerVehicleType = vehicleType.toLowerCase()
    
    if (lowerVehicleType.includes('motorschlitten') || 
        lowerTypeName.includes('snowmobile') ||
        lowerTypeName.includes('skidoo') ||
        lowerTypeName.includes('lynx') ||
        lowerTypeName.includes('snow')) {
      return { type: 'snowmobile', make: 'Ski-Doo' }
    }
    
    if (lowerVehicleType.includes('quad') || 
        lowerVehicleType.includes('atv') ||
        lowerVehicleType.includes('all-terrain') ||
        lowerTypeName.includes('polaris') ||
        lowerTypeName.includes('can-am') ||
        lowerTypeName.includes('canam') ||
        lowerTypeName.includes('grizzly') ||
        lowerTypeName.includes('raptor') ||
        lowerTypeName.includes('kvf')) {
      return { type: 'atv', make: typeName.includes('KAWASAKI') ? 'Kawasaki' : 'Polaris' }
    }
    
    if (lowerVehicleType.includes('motorrad') || 
        lowerVehicleType.includes('moto') ||
        lowerTypeName.includes('kawasaki') ||
        lowerTypeName.includes('yamaha') ||
        lowerTypeName.includes('honda') ||
        lowerTypeName.includes('suzuki') ||
        lowerTypeName.includes('ducati') ||
        lowerTypeName.includes('ktm') ||
        lowerTypeName.includes('bmw motorrad')) {
      return { type: 'motorcycle', make: 'Honda' }
    }

    if (lowerVehicleType.includes('roller') || 
        lowerVehicleType.includes('scooter') ||
        lowerTypeName.includes('vespa') ||
        lowerTypeName.includes('piaggio')) {
      return { type: 'scooter', make: 'Vespa' }
    }
    
    if (lowerVehicleType.includes('kleinmotorfahrzeug')) {
      if (typeName.includes('AB') && typeName.includes('KAWASAKI')) {
        return { type: 'atv', make: 'Kawasaki' }
      }
    }
    
    return null
  }

  const specialVehicle = detectSpecialVehicle(typeName, vehicleType)
  if (specialVehicle) {
    make = specialVehicle.make
    model = typeName.replace('AB', '').replace('KAWASAKI', '').trim()
    console.log('🚀 Detected special vehicle:', specialVehicle)
  } else {
    const commonMakes = [
      'Volkswagen', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Opel', 'Skoda', 
      'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Seat', 'Hyundai', 'Kia', 'Mazda', 
      'Mitsubishi', 'Nissan', 'Honda', 'Subaru', 'Suzuki', 'Volvo', 'Jaguar', 
      'Land Rover', 'Mini', 'Smart', 'Alfa Romeo', 'Chevrolet', 'Chrysler', 'Dodge', 'Jeep',
      'Porsche', 'Tesla', 'AB'
    ]
    
    for (const carMake of commonMakes) {
      if (typeName.toLowerCase().includes(carMake.toLowerCase())) {
        make = carMake
        model = typeName.replace(carMake, '').trim()
        model = model.replace(/^\s*-\s*/, '').trim()
        break
      }
    }

    if (!make && typeName) {
      const words = typeName.split(' ')
      if (words.length > 1) {
        make = words[0]
        model = words.slice(1).join(' ').trim()
      }
    }
    
    if (!make) {
      make = 'Other'
      model = typeName
    }
  }
  
  form.value.make = make
  form.value.model = model
  
  let estimatedYear = new Date().getFullYear() - 3
  
  if (typenscheinSearch.value) {
    const yearMatch = typenscheinSearch.value.match(/^(\d{2})/)
    if (yearMatch) {
      const shortYear = parseInt(yearMatch[1])
      if (shortYear >= 0 && shortYear <= 25) {
        estimatedYear = 2000 + shortYear
      } else if (shortYear > 25 && shortYear <= 99) {
        estimatedYear = 1900 + shortYear
      }
    }
  }
  
  if (data['Typenschein Erstellung']) {
    const dateMatch = data['Typenschein Erstellung'].match(/(\d{2})\.(\d{2})\.(\d{4})/)
    if (dateMatch) {
      const creationYear = parseInt(dateMatch[3])
      if (creationYear >= 1990 && creationYear <= new Date().getFullYear()) {
        estimatedYear = creationYear
      }
    }
  }
  
  form.value.year = estimatedYear.toString()
  
  const fuelMap: { [key: string]: string } = {
    'Benzin': 'petrol',
    'Diesel': 'diesel',
    'Elektro': 'electric',
    'Electric': 'electric',
    'Hybrid': 'hybrid',
    'Wasserstoff': 'hydrogen',
    'Erdgas': 'cng',
    'Autogas': 'lpg',
    'LPG': 'lpg',
    'CNG': 'cng'
  }
  
  const fuelType = data.Treibstoffcode || ''
  form.value.fuelType = fuelMap[fuelType] || 'petrol'
  
  const driveMap: { [key: string]: string } = {
    'Vorderrad': 'fwd',
    'Allrad': 'awd',
    'Hinterrad': 'rwd',
    '4x4': 'awd',
    'Raupenantrieb': 'track'
  }
  
  const driveTypeText = data.Antrieb || ''
  form.value.driveType = driveMap[driveTypeText] || 'fwd'
  
  const powerText = data.Kw || ''
  let powerPs = 0
  
  const psMatch = powerText.match(/(\d+)\s*PS/) || 
                  powerText.match(/\((\d+)\s*PS\)/) ||
                  powerText.match(/\b(\d+)\s*(?:PS|ps)/)
  
  if (psMatch) {
    powerPs = parseInt(psMatch[1])
  } else {
    const kwMatch = powerText.match(/(\d+[,.]?\d*)\s*kW/) || 
                    powerText.match(/\b(\d+[,.]?\d*)\b/)
    if (kwMatch) {
      const kwValue = kwMatch[1].replace(',', '.')
      const kw = parseFloat(kwValue)
      if (!isNaN(kw)) {
        powerPs = Math.round(kw * 1.36)
      }
    }
  }
  
  if (powerPs === 0) {
    powerPs = data.Ccm ? Math.round(data.Ccm / 10) : 50
  }
  
  form.value.power = powerPs.toString()
  
  const displacement = data.Ccm ? parseInt(data.Ccm) : 0
  if (displacement > 0) {
    form.value.engineSize = `${(displacement / 1000).toFixed(1)}L`
    form.value.displacement = displacement.toString()
  } else {
    form.value.engineSize = '1.6L'
  }
  
  if (data.Zylinder) {
    form.value.cylinders = data.Zylinder.toString()
    console.log('✅ Set cylinders from typenschein:', form.value.cylinders)
  } else {
    if (vehicleType.includes('Personenwagen') || vehicleType.includes('Auto')) {
      form.value.cylinders = '4'
    } else if (vehicleType.includes('Motorrad') || vehicleType.includes('Moto')) {
      form.value.cylinders = '1'
    } else {
      form.value.cylinders = ''
    }
  }
  
  form.value.seats = data.Sitplätze ? data.Sitplätze.toString() : '5'
  
  const bodyTypeText = data.Karosserieform || ''
  const vehicleTypeText = data.Fahrzeugart || ''

  console.log('🔍 Body type mapping - Raw data:', { bodyTypeText, vehicleTypeText })

  let bodyType = 'other'

  if (vehicleTypeText.includes('Motorschlitten')) {
    bodyType = 'snowmobile'
    console.log('✅ Mapped to snowmobile from Fahrzeugart')
  } else if (vehicleTypeText.includes('Motorrad') || vehicleTypeText.includes('Moto')) {
    bodyType = 'motorcycle'
    console.log('✅ Mapped to motorcycle from Fahrzeugart')
  } else if (vehicleTypeText.includes('Quad') || vehicleTypeText.includes('ATV') || vehicleTypeText.includes('All-Terrain') || vehicleTypeText.includes('Kleinmotorfahrzeug')) {
    bodyType = 'atv'
    console.log('✅ Mapped to atv from Fahrzeugart')
  } else if (vehicleTypeText.includes('Roller') || vehicleTypeText.includes('Scooter')) {
    bodyType = 'scooter'
    console.log('✅ Mapped to scooter from Fahrzeugart')
  } else {
    if (bodyTypeText) {
      const bodyTypeLower = bodyTypeText.toLowerCase()
      
      if (bodyTypeLower.includes('limousine') || bodyTypeLower === '163 limousine') {
        bodyType = 'sedan'
      } else if (bodyTypeLower.includes('kombi') || bodyTypeLower.includes('station') || bodyTypeLower.includes('estate') || bodyTypeLower.includes('touring')) {
        bodyType = 'station_wagon'
      } else if (bodyTypeLower.includes('suv') || bodyTypeLower.includes('gelände') || bodyTypeLower.includes('off-road') || bodyTypeLower.includes('allroad')) {
        bodyType = 'suv'
      } else if (bodyTypeLower.includes('cabrio') || bodyTypeLower.includes('convertible') || bodyTypeLower.includes('cabriolet')) {
        bodyType = 'cabriolet'
      } else if (bodyTypeLower.includes('coupé') || bodyTypeLower.includes('coupe')) {
        bodyType = 'coupe'
      } else if (bodyTypeLower.includes('kleinwagen') || bodyTypeLower.includes('compact') || bodyTypeLower.includes('city')) {
        bodyType = 'compact'
      } else if (bodyTypeLower.includes('pick-up') || bodyTypeLower.includes('pickup')) {
        bodyType = 'pickup'
      } else if (bodyTypeLower.includes('minivan') || bodyTypeLower.includes('van') || bodyTypeLower.includes('minibus') || bodyTypeLower.includes('kastenwagen')) {
        bodyType = 'minivan'
      } else if (bodyTypeLower.includes('van') || bodyTypeLower.includes('bus') || bodyTypeLower.includes('transporter')) {
        bodyType = 'van'
      } else if (bodyTypeLower.includes('schrägheck') || bodyTypeLower.includes('hatchback') || bodyTypeLower.includes('heck')) {
        bodyType = 'hatchback'
      } else if (bodyTypeLower.includes('roadster')) {
        bodyType = 'roadster'
      } else if (bodyTypeLower.includes('targa')) {
        bodyType = 'targa'
      } else if (bodyTypeLower.includes('offen')) {
        bodyType = 'convertible'
      } else {
        const numericMatch = bodyTypeText.match(/(\d+)/)
        if (numericMatch) {
          const code = numericMatch[1]
          const codeMappings: { [key: string]: string } = {
            '163': 'sedan',
            '164': 'station_wagon',
            '165': 'hatchback',
            '166': 'coupe',
            '167': 'cabriolet',
            '168': 'suv',
            '169': 'van',
            '170': 'pickup',
            '175': 'convertible'
          }
          if (codeMappings[code]) {
            bodyType = codeMappings[code]
          } else {
            bodyType = 'sedan'
          }
        } else {
          bodyType = 'sedan'
        }
      }
    } else {
      bodyType = 'sedan'
    }
  }

  form.value.bodyType = bodyType
  
  console.log('🎯 Final body type mapping result:', { originalBodyType: bodyTypeText, originalVehicleType: vehicleTypeText, finalBodyType: bodyType })
  
  if (data['Leergewicht kg']) {
    form.value.weightEmpty = data['Leergewicht kg']
  }
  if (data['Gesamtgewicht kg']) {
    form.value.weightTotal = data['Gesamtgewicht kg']
  }
  
  form.value.typenscheinNr = typenscheinResults.value.Nr || typenscheinSearch.value
  
  form.value.mileage = ''
  
  if (form.value.listingType === 'auction') {
    form.value.startingPrice = ''
  } else {
    form.value.price = ''
  }
  
  form.value.condition = 'good'
  form.value.colorExterior = 'black'
  
  let transmission = 'manual'
  if (vehicleTypeText.includes('Motorschlitten') || vehicleTypeText.includes('ATV') || vehicleTypeText.includes('Quad')) {
    transmission = 'cvt'
  } else if (typeName.toLowerCase().includes('automatik') || typeName.toLowerCase().includes('automatic')) {
    transmission = 'automatic'
  }
  
  form.value.transmission = transmission
  form.value.vehicleType = data.Fahrzeugart || ''
  
  console.log('✅ Form auto-filled with Typenschein data')
  console.log('📊 Final auto-filled data:', {
    make: form.value.make,
    model: form.value.model,
    year: form.value.year,
    fuelType: form.value.fuelType,
    power: form.value.power,
    bodyType: form.value.bodyType,
    vehicleType: vehicleTypeText,
    transmission: form.value.transmission,
    driveType: form.value.driveType,
    engineSize: form.value.engineSize,
    cylinders: form.value.cylinders,
    seats: form.value.seats,
    weightEmpty: form.value.weightEmpty,
    weightTotal: form.value.weightTotal
  })

  currentStep.value = 2
}

const formatFuelTypeDisplay = (fuelType: string) => {
  const types: Record<string, string> = {
    'petrol': t('fuel_petrol') || 'Petrol',
    'diesel': t('fuel_diesel') || 'Diesel',
    'electric': t('fuel_electric') || 'Electric',
    'hybrid': t('fuel_hybrid') || 'Hybrid',
    'lpg': t('fuel_lpg') || 'LPG',
    'cng': t('fuel_cng') || 'CNG'
  }
  return types[fuelType] || fuelType
}

const formatBodyTypeDisplay = (bodyType: string) => {
  const types: Record<string, string> = {
    'sedan': t('car_listing_form.body_types.sedan') || 'Sedan',
    'suv': t('car_listing_form.body_types.suv') || 'SUV',
    'station_wagon': t('car_listing_form.body_types.station_wagon') || 'Station Wagon',
    'cabriolet': t('car_listing_form.body_types.cabriolet') || 'Cabriolet',
    'coupe': t('car_listing_form.body_types.coupe') || 'Coupé',
    'compact': t('car_listing_form.body_types.compact') || 'Compact',
    'pickup': t('car_listing_form.body_types.pickup') || 'Pick-up',
    'minivan': t('car_listing_form.body_types.minivan') || 'Minivan',
    'van': t('car_listing_form.body_types.van') || 'Van'
  }
  return types[bodyType] || bodyType
}

const switchToManual = () => {
  entryMethod.value = 'manual'
  currentStep.value = 1
}

const loadUserData = async () => {
  try {
    console.log('🚀 Loading user data for car listing form...')
    userLoading.value = true
    
    const { data, error } = await useFetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (error.value) {
      console.error('❌ Error fetching user data:', error.value)
      return
    }

    if (data.value?.user) {
      userData.value = data.value.user
      console.log('✅ User data loaded:', userData.value)
      
      prefilleFormWithUserData()
    }
  } catch (error) {
    console.error('❌ Unexpected error loading user data:', error)
  } finally {
    userLoading.value = false
  }
}

const prefilleFormWithUserData = () => {
  if (!userData.value) return
  
  console.log('🔄 Prefilling form with user data...')
  
  form.value.sellerName = userData.value.name || ''
  form.value.sellerEmail = userData.value.email || ''
  form.value.sellerPhone = userData.value.phone || ''
  form.value.canton = userData.value.canton || ''
  form.value.city = userData.value.city || ''
  form.value.zipCode = userData.value.zipCode || ''
  form.value.streetAddress = userData.value.streetAddress || ''
  
  if (userData.value.role === 'seller') {
    form.value.sellerType = userData.value.businessType || 'private'
    if ((userData.value.businessType === 'dealer' || userData.value.businessType === 'business') && userData.value.companyName) {
      form.value.sellerName = userData.value.companyName
    }
  } else {
    form.value.sellerType = 'private'
  }
  
  console.log('✅ Form prefilled with user data')
}

watch(() => currentStep.value, (newStep) => {
  console.log('🔍 Step changed:', newStep, 'Current Main Step:', currentMainStep.value)
  if ((newStep === (entryMethod.value === 'typenschein' ? 2 : 1) || currentMainStep.value === 4) && !userData.value && !userLoading.value) {
    console.log('🎯 Loading user data...')
    loadUserData()
  }
})

const onMakeChange = () => {
  form.value.model = ''
}

const nextMainStep = () => {
  console.log('Next main step clicked')
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousMainStep = () => {
  console.log('Previous main step clicked')
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextStep = () => {
  console.log('Next step clicked from listing type')
  console.log('Can proceed listing type?', canProceedListingType.value)
  if (canProceedListingType.value) {
    currentStep.value++
    console.log('New current step:', currentStep.value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    console.log('Cannot proceed from listing type')
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  uploadingImages.value = true
  uploadProgress.value = 0

  const total = files.length
  let done = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file.type.startsWith('image/')) continue

    const previewUrl = URL.createObjectURL(file)
    const imageEntry = { url: previewUrl, uploading: true, error: false }
    form.value.images.push(imageEntry)
    const idx = form.value.images.length - 1

    try {
      const fd = new FormData()
      fd.append('file', file)

      const result = await $fetch('/api/upload/image', {
        method: 'POST',
        body: fd,
      })

      URL.revokeObjectURL(previewUrl)
      form.value.images[idx] = { url: result.url, uploading: false, error: false }
    } catch (err) {
      console.error('Image upload failed:', err)
      form.value.images[idx] = { url: previewUrl, uploading: false, error: true }
    }

    done++
    uploadProgress.value = Math.round((done / total) * 100)
  }

  uploadingImages.value = false
  if (target) target.value = ''
}

const removeImage = (index: number) => {
  const img = form.value.images[index]
  if (img.url.startsWith('blob:')) {
    URL.revokeObjectURL(img.url)
  }
  form.value.images.splice(index, 1)
}

const validateDescription = () => {}

const getStepClass = (stepId: number) => {
  const mainStep = currentMainStep.value
  if (stepId < mainStep) {
    return 'bg-green-500 text-white'
  } else if (stepId === mainStep) {
    return 'bg-red-600 text-white shadow-lg'
  } else {
    return 'bg-gray-300 text-gray-600'
  }
}

const getStepTextClass = (stepId: number) => {
  const mainStep = currentMainStep.value
  if (stepId <= mainStep) {
    return 'text-gray-900 font-semibold'
  } else {
    return 'text-gray-500'
  }
}

const submitListing = async () => {
  console.log('🚀 Starting submission process...')
  
  if (!isFinalStepValid.value) {
    alert(t('car_listing_form.complete_required_fields') || 'Please complete all required fields: write a description (50+ characters) and accept the terms and conditions.')
    return
  }

  let requiredFields: { key: string; label: string }[] = [
    { key: 'make', label: t('car_listing_form.make') || 'Make' },
    { key: 'model', label: t('car_listing_form.model') || 'Model' },
    { key: 'year', label: t('car_listing_form.year') || 'Year' },
    { key: 'mileage', label: t('car_listing_form.mileage') || 'Mileage' },
    { key: 'fuelType', label: t('car_listing_form.fuel_type') || 'Fuel Type' },
    { key: 'transmission', label: t('car_listing_form.transmission') || 'Transmission' },
    { key: 'bodyType', label: t('car_listing_form.body_type') || 'Body Type' },
    { key: 'power', label: t('car_listing_form.power') || 'Power' },
    { key: 'driveType', label: t('car_listing_form.drive_type') || 'Drive Type' },
    { key: 'colorExterior', label: t('car_listing_form.exterior_color') || 'Exterior Color' },
    { key: 'condition', label: t('car_listing_form.condition') || 'Condition' },
    { key: 'canton', label: t('car_listing_form.canton') || 'Canton' },
    { key: 'city', label: t('car_listing_form.city') || 'City' },
    { key: 'zipCode', label: t('car_listing_form.zip_code') || 'ZIP Code' },
    { key: 'sellerType', label: t('car_listing_form.seller_type') || 'Seller Type' },
    { key: 'sellerName', label: t('car_listing_form.contact_name') || 'Contact Name' },
    { key: 'sellerPhone', label: t('car_listing_form.phone') || 'Phone Number' },
    { key: 'sellerEmail', label: t('car_listing_form.email') || 'Email' }
  ]

  if (form.value.listingType === 'auction') {
    requiredFields.push({ key: 'startingPrice', label: t('auction.starting_price') || 'Starting Price' })
  } else {
    requiredFields.push({ key: 'price', label: t('car_listing_form.export_price') || 'Price' })
  }

  const missingFields = requiredFields.filter(field => !form.value[field.key as keyof typeof form.value])
  
  if (missingFields.length > 0) {
    const missingLabels = missingFields.map(f => f.label).join(', ')
    alert(t('car_listing_form.fill_required_fields', { fields: missingLabels }) || `Please fill in all required fields:\n${missingLabels}`)
    return
  }

  isSubmitting.value = true
  
  try {
    const submissionData: any = {
      auctionDurationDays: form.value.auctionDurationDays || 7,
      make: form.value.make,
      model: form.value.model,
      year: parseInt(form.value.year),
      mileage: parseInt(form.value.mileage),
      fuelType: form.value.fuelType,
      transmission: form.value.transmission,
      bodyType: form.value.bodyType,
      ...(form.value.listingType === 'auction' ? {
        startingPrice: parseFloat(form.value.startingPrice),
        price: parseFloat(form.value.startingPrice),
        reservePrice: form.value.reservePrice ? parseFloat(form.value.reservePrice) : null
      } : {
        price: parseFloat(form.value.price)
      }),
      power: parseInt(form.value.power),
      cylinders: form.value.cylinders ? parseInt(form.value.cylinders) : null,
      driveType: form.value.driveType,
      engineSize: form.value.engineSize,
      doors: form.value.doors ? parseInt(form.value.doors) : null,
      seats: form.value.seats ? parseInt(form.value.seats) : null,
      colorExterior: form.value.colorExterior,
      colorInterior: form.value.colorInterior,
      condition: form.value.condition,
      vin: form.value.vin,
      firstRegistration: form.value.firstRegistration,
      equipment: form.value.equipment,
      additionalFeatures: form.value.additionalFeatures,
      canton: form.value.canton,
      city: form.value.city,
      zipCode: form.value.zipCode,
      sellerType: form.value.sellerType,
      sellerName: form.value.sellerName,
      sellerPhone: form.value.sellerPhone,
      sellerEmail: form.value.sellerEmail,
      exportDocuments: form.value.exportDocuments,
      withWarranty: form.value.withWarranty,
      validInspection: form.value.validInspection,
      hasAccident: form.value.hasAccident,
      description: form.value.description,
      images: form.value.images.filter(img => !img.error).map(img => img.url),
      typenscheinNr: form.value.typenscheinNr,
      typenscheinData: typenscheinResults.value,
      displacement: form.value.displacement ? parseInt(form.value.displacement) : null,
      weightEmpty: form.value.weightEmpty,
      weightTotal: form.value.weightTotal,
      vehicleType: form.value.vehicleType,
      powerPs: parseInt(form.value.power),
      powerKw: Math.round(parseInt(form.value.power) / 1.36),
      status: form.value.listingType === 'auction' ? 'auction' : 'active',
      isFeatured: false
    }

    const { data, error } = await useFetch('/api/cars/create', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    })

    if (error.value) {
      console.error('❌ API Error:', error.value)
      if (error.value.statusCode === 402) {
        alert(t('car_listing_form.insufficient_funds_api', { message: error.value.data?.statusMessage }) || `Insufficient funds: ${error.value.data?.statusMessage}\n\nPlease add funds to your wallet and try again.`)
        return
      }
      throw new Error(error.value.data?.statusMessage || t('car_listing_form.failed_create_listing') || 'Failed to create listing')
    }

    if (data.value) {
      console.log('✅ Listing created successfully:', data.value)
      
      let successMessage = t('car_listing_form.success_created') || 'Car listing created successfully! '
      if (data.value.freeListing) {
        successMessage += t('car_listing_form.free_listing_success') || 'Your listing is free (first 6 months).'
      } else {
        successMessage += t('car_listing_form.fee_deducted', { fee: listingFee.value }) || `${listingFee.value} CHF was deducted from your account.`
      }
      
      if (form.value.listingType === 'auction') {
        successMessage += t('car_listing_form.auction_live') || '\n\nYour auction is now live for 7 days. Good luck!'
      }
      
      alert(successMessage)
      
      resetForm()
      
      if (data.value.car?.id) {
        await navigateTo(`/cars/${data.value.car.id}`)
      } else {
        await navigateTo('/cars')
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error submitting listing:', error)
    alert(error.message || t('car_listing_form.error_creating') || 'Error creating listing. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  const userContactInfo = {
    sellerName: form.value.sellerName,
    sellerEmail: form.value.sellerEmail,
    sellerPhone: form.value.sellerPhone,
    canton: form.value.canton,
    city: form.value.city,
    zipCode: form.value.zipCode,
    streetAddress: form.value.streetAddress,
    sellerType: form.value.sellerType
  }
  
  Object.keys(form.value).forEach(key => {
    if (key === 'images') {
      form.value.images.forEach(image => { if (image.url.startsWith('blob:')) URL.revokeObjectURL(image.url) })
      form.value.images = []
    } else if (Array.isArray(form.value[key as keyof typeof form.value])) {
      (form.value[key as keyof typeof form.value] as any) = []
    } else if (typeof form.value[key as keyof typeof form.value] === 'boolean') {
      (form.value[key as keyof typeof form.value] as any) = false
    } else if (!userContactInfo.hasOwnProperty(key)) {
      (form.value[key as keyof typeof form.value] as any) = ''
    }
  })
  
  Object.assign(form.value, userContactInfo)
  
  currentStep.value = 0
  entryMethod.value = null
  form.value.acceptedTerms = false
  form.value.listingType = 'normal'
  typenscheinResults.value = null
  typenscheinSearch.value = ''
  listingFeeCheckFailed.value = false
}

// Options arrays
const fuelTypes = [
  { value: 'petrol', label: t('fuel_petrol') || 'Petrol' },
  { value: 'diesel', label: t('fuel_diesel') || 'Diesel' },
  { value: 'electric', label: t('fuel_electric') || 'Electric' },
  { value: 'hybrid', label: t('fuel_hybrid') || 'Hybrid' },
  { value: 'lpg', label: t('fuel_lpg') || 'LPG' },
  { value: 'cng', label: t('fuel_cng') || 'CNG' }
]

const transmissionTypes = [
  { value: 'manual', label: t('transmission_manual') || 'Manual' },
  { value: 'automatic', label: t('transmission_automatic') || 'Automatic' },
  { value: 'semi_automatic', label: t('car_listing_form.semi_automatic') || 'Semi-Automatic' }
]

const bodyTypes = [
  { value: 'sedan', label: t('car_listing_form.body_types.sedan') || 'Sedan' },
  { value: 'hatchback', label: t('car_listing_form.body_types.hatchback') || 'Hatchback' },
  { value: 'liftback', label: t('car_listing_form.body_types.liftback') || 'Liftback' },
  { value: 'station_wagon', label: t('car_listing_form.body_types.station_wagon') || 'Station Wagon' },
  { value: 'suv', label: t('car_listing_form.body_types.suv') || 'SUV' },
  { value: 'crossover', label: t('car_listing_form.body_types.crossover') || 'Crossover' },
  { value: 'coupe', label: t('car_listing_form.body_types.coupe') || 'Coupé' },
  { value: 'convertible', label: t('car_listing_form.body_types.convertible') || 'Convertible' },
  { value: 'cabriolet', label: t('car_listing_form.body_types.cabriolet') || 'Cabriolet' },
  { value: 'roadster', label: t('car_listing_form.body_types.roadster') || 'Roadster' },
  { value: 'targa', label: t('car_listing_form.body_types.targa') || 'Targa' },
  { value: 'minivan', label: t('car_listing_form.body_types.minivan') || 'Minivan' },
  { value: 'van', label: t('car_listing_form.body_types.van') || 'Van' },
  { value: 'mpv', label: t('car_listing_form.body_types.mpv') || 'MPV' },
  { value: 'pickup', label: t('car_listing_form.body_types.pickup') || 'Pick-up Truck' },
  { value: 'compact', label: t('car_listing_form.body_types.compact') || 'Compact Car' },
  { value: 'subcompact', label: t('car_listing_form.body_types.subcompact') || 'Subcompact Car' },
  { value: 'microcar', label: t('car_listing_form.body_types.microcar') || 'Microcar' },
  { value: 'limousine', label: t('car_listing_form.body_types.limousine') || 'Limousine' },
  { value: 'sports_car', label: t('car_listing_form.body_types.sports_car') || 'Sports Car' },
  { value: 'supercar', label: t('car_listing_form.body_types.supercar') || 'Supercar' },
  { value: 'hypercar', label: t('car_listing_form.body_types.hypercar') || 'Hypercar' },
  { value: 'muscle_car', label: t('car_listing_form.body_types.muscle_car') || 'Muscle Car' },
  { value: 'hot_hatch', label: t('car_listing_form.body_types.hot_hatch') || 'Hot Hatch' },
  { value: 'gt_car', label: t('car_listing_form.body_types.gt_car') || 'Grand Tourer' },
  { value: 'motorcycle', label: t('car_listing_form.body_types.motorcycle') || 'Motorcycle' },
  { value: 'scooter', label: t('car_listing_form.body_types.scooter') || 'Scooter' },
  { value: 'naked_bike', label: t('car_listing_form.body_types.naked_bike') || 'Naked Bike' },
  { value: 'sport_bike', label: t('car_listing_form.body_types.sport_bike') || 'Sport Bike' },
  { value: 'cruiser', label: t('car_listing_form.body_types.cruiser') || 'Cruiser' },
  { value: 'touring', label: t('car_listing_form.body_types.touring') || 'Touring Motorcycle' },
  { value: 'adventure', label: t('car_listing_form.body_types.adventure') || 'Adventure Motorcycle' },
  { value: 'dual_sport', label: t('car_listing_form.body_types.dual_sport') || 'Dual Sport' },
  { value: 'motocross', label: t('car_listing_form.body_types.motocross') || 'Motocross' },
  { value: 'supermoto', label: t('car_listing_form.body_types.supermoto') || 'Supermoto' },
  { value: 'cafe_racer', label: t('car_listing_form.body_types.cafe_racer') || 'Café Racer' },
  { value: 'chopper', label: t('car_listing_form.body_types.chopper') || 'Chopper' },
  { value: 'bobber', label: t('car_listing_form.body_types.bobber') || 'Bobber' },
  { value: 'atv', label: t('car_listing_form.body_types.atv') || 'ATV / Quad' },
  { value: 'utv', label: t('car_listing_form.body_types.utv') || 'UTV / Side-by-Side' },
  { value: 'snowmobile', label: t('car_listing_form.body_types.snowmobile') || 'Snowmobile' },
  { value: 'personal_watercraft', label: t('car_listing_form.body_types.personal_watercraft') || 'Personal Watercraft' },
  { value: 'jet_ski', label: t('car_listing_form.body_types.jet_ski') || 'Jet Ski' },
  { value: 'truck', label: t('car_listing_form.body_types.truck') || 'Truck' },
  { value: 'lorry', label: t('car_listing_form.body_types.lorry') || 'Lorry' },
  { value: 'box_truck', label: t('car_listing_form.body_types.box_truck') || 'Box Truck' },
  { value: 'flatbed_truck', label: t('car_listing_form.body_types.flatbed_truck') || 'Flatbed Truck' },
  { value: 'dump_truck', label: t('car_listing_form.body_types.dump_truck') || 'Dump Truck' },
  { value: 'bus', label: t('car_listing_form.body_types.bus') || 'Bus' },
  { value: 'minibus', label: t('car_listing_form.body_types.minibus') || 'Minibus' },
  { value: 'coach', label: t('car_listing_form.body_types.coach') || 'Coach' },
  { value: 'tractor', label: t('car_listing_form.body_types.tractor') || 'Tractor' },
  { value: 'construction_vehicle', label: t('car_listing_form.body_types.construction_vehicle') || 'Construction Vehicle' },
  { value: 'agricultural_vehicle', label: t('car_listing_form.body_types.agricultural_vehicle') || 'Agricultural Vehicle' },
  { value: 'other', label: t('car_listing_form.body_types.other') || 'Other' }
]

const driveTypes = [
  { value: 'fwd', label: t('car_listing_form.drive_types.fwd') || 'Front-wheel drive' },
  { value: 'rwd', label: t('car_listing_form.drive_types.rwd') || 'Rear-wheel drive' },
  { value: 'awd', label: t('car_listing_form.drive_types.awd') || 'All-wheel drive' }
]

const conditions = [
  { value: 'excellent', label: t('condition_excellent') || 'Excellent' },
  { value: 'good', label: t('condition_good') || 'Good' },
  { value: 'fair', label: t('condition_fair') || 'Fair' },
  { value: 'poor', label: t('condition_poor') || 'Poor' }
]

const exteriorColors = [
  { value: 'black', label: t('colors.black') || 'Black' },
  { value: 'white', label: t('colors.white') || 'White' },
  { value: 'silver', label: t('colors.silver') || 'Silver' },
  { value: 'gray', label: t('colors.gray') || 'Gray' },
  { value: 'blue', label: t('colors.blue') || 'Blue' },
  { value: 'red', label: t('colors.red') || 'Red' },
  { value: 'green', label: t('colors.green') || 'Green' },
  { value: 'brown', label: t('colors.brown') || 'Brown' }
]

const interiorColors = [
  { value: 'black', label: t('colors.black') || 'Black' },
  { value: 'beige', label: t('colors.beige') || 'Beige' },
  { value: 'brown', label: t('colors.brown') || 'Brown' },
  { value: 'gray', label: t('colors.gray') || 'Gray' }
]

const doorOptions = [2, 3, 4, 5]
const seatOptions = [2, 4, 5, 7, 8]

const equipmentFeatures = [
  { value: 'air_conditioning', label: t('equipment.air_conditioning') || 'Air Conditioning' },
  { value: 'navigation', label: t('equipment.navigation') || 'Navigation System' },
  { value: 'parking_sensors', label: t('equipment.parking_sensors') || 'Parking Sensors' },
  { value: 'rear_camera', label: t('equipment.rear_camera') || 'Rear Camera' },
  { value: 'leather_seats', label: t('equipment.leather_seats') || 'Leather Seats' },
  { value: 'sunroof', label: t('equipment.sunroof') || 'Sunroof' },
  { value: 'xenon_lights', label: t('equipment.xenon_lights') || 'Xenon Headlights' },
  { value: 'led_lights', label: t('equipment.led_lights') || 'LED Headlights' },
  { value: 'alloy_wheels', label: t('equipment.alloy_wheels') || 'Alloy Wheels' },
  { value: 'cruise_control', label: t('equipment.cruise_control') || 'Cruise Control' },
  { value: 'bluetooth', label: t('equipment.bluetooth') || 'Bluetooth' },
  { value: 'android_auto', label: t('equipment.android_auto') || 'Android Auto' },
  { value: 'apple_carplay', label: t('equipment.apple_carplay') || 'Apple CarPlay' },
  { value: 'heated_seats', label: t('equipment.heated_seats') || 'Heated Seats' },
  { value: 'electric_seats', label: t('equipment.electric_seats') || 'Electric Seats' },
  { value: 'panorama_roof', label: t('equipment.panorama_roof') || 'Panorama Roof' },
  { value: 'towbar', label: t('equipment.towbar') || 'Towbar' },
  { value: 'isofix', label: t('equipment.isofix') || 'Isofix' }
]

const cantons = ['Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura']

// Initialize
onMounted(() => {
  console.log('🔄 CarListingForm mounted, loading user data...')
  loadUserData()
})
</script>

<style scoped>
.form-group {
  @apply space-y-2;
}
.swiss-form-input {
  @apply w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-sm sm:text-base;
}
.swiss-btn-primary {
  @apply bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base;
}
.swiss-btn-secondary {
  @apply bg-white text-red-600 border border-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base;
}
.swiss-form-section {
  @apply bg-white rounded-2xl border border-gray-200;
}
.swiss-section-icon {
  @apply w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center text-white;
}
.swiss-form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}
.swiss-progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}
.swiss-progress-fill {
  @apply bg-red-600 h-2 rounded-full transition-all duration-500;
}
.swiss-header {
  @apply bg-gradient-to-r from-red-600 to-red-800 text-white;
}
.swiss-form-container {
  @apply bg-white rounded-2xl shadow-lg border border-gray-200;
}
@media (max-width: 640px) {
  .xs\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .xs\:block { display: block; }
}
.relative {
  position: relative;
}
.relative input {
  padding-left: 3.5rem !important;
}
.relative span {
  z-index: 1;
  pointer-events: none;
}
@media (max-width: 480px) {
  .swiss-form-section { @apply p-3; }
  .swiss-btn-primary, .swiss-btn-secondary { @apply px-3 py-2 text-xs; }
}
</style>
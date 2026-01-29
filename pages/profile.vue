<!-- pages/profile.vue - INTERNATIONALIZED VERSION -->
<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
      </div>
      <div class="animate-pulse bg-gray-200 h-48 rounded-xl"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 rounded-xl p-6 text-center border border-red-300">
      <p class="text-red-700">{{ error }}</p>
      <NuxtLink to="/login" class="text-red-800 hover:underline mt-2 inline-block">
        {{ t('profile.error.login_to_view') || 'Please login to view your profile' }}
      </NuxtLink>
    </div>

    <!-- Profile content -->
    <div v-else class="space-y-8">
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-red-100 to-red-200 rounded-xl p-6 border border-red-300">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center">
            <div class="relative">
              <div class="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <span class="text-3xl font-bold text-white">{{ userInitial }}</span>
              </div>
              <button 
                @click="showImageUpload = true"
                class="absolute bottom-2 right-2 bg-red-800 text-white p-1 rounded-full hover:bg-red-900"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
            <div class="text-center md:text-left">
              <h1 class="text-2xl font-bold text-red-800">{{ profileData.user.name }}</h1>
              <p class="text-red-700 flex items-center gap-2">
                <span>{{ profileData.user.role === 'seller' ? t('profile.role.verified_seller') : t('profile.role.registered_buyer') }}</span>
                <span v-if="profileData.user.verifiedBuyer" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✓ {{ t('profile.verified') }}
                </span>
              </p>
              <p class="text-red-600 text-sm mt-1">{{ t('profile.member_since') }} {{ formattedJoinDate }}</p>
            </div>
          </div>
          
          <!-- Account Balance -->
          <div class="mt-4 md:mt-0 bg-white/50 rounded-lg p-4 text-center border border-red-200 min-w-[200px]">
            <p class="text-red-600 text-sm">{{ t('profile.account_balance') }}</p>
            <p class="text-2xl font-bold text-red-800">{{ profileData.user.funds || 0 }} {{ t('currency.chf') }}</p>
            <p class="text-red-500 text-xs mt-1">{{ t('profile.contact_admin_funds') || 'Contact admin for fund management' }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="glass p-4 rounded-lg border border-red-200">
          <p class="text-red-600 text-sm">{{ t('profile.stats.listings') }}</p>
          <p class="text-2xl font-bold text-red-800">{{ profileData.stats.totalListings || 0 }}</p>
          <p class="text-red-500 text-xs mt-1">{{ t('profile.stats.total') }}</p>
        </div>
        <div class="glass p-4 rounded-lg border border-red-200">
          <p class="text-red-600 text-sm">{{ t('profile.stats.active') }}</p>
          <p class="text-2xl font-bold text-red-800">{{ profileData.stats.activeListings || 0 }}</p>
          <p class="text-red-500 text-xs mt-1">{{ t('profile.stats.listings') }}</p>
        </div>
        <div class="glass p-4 rounded-lg border border-red-200">
          <p class="text-red-600 text-sm">{{ t('profile.stats.cars_sold') }}</p>
          <p class="text-2xl font-bold text-red-800">{{ profileData.stats.carsSold || 0 }}</p>
          <p class="text-red-500 text-xs mt-1">{{ t('profile.stats.lifetime') }}</p>
        </div>
        <div class="glass p-4 rounded-lg border border-red-200">
          <p class="text-red-600 text-sm">{{ t('profile.stats.account') }}</p>
          <p class="text-2xl font-bold" :class="profileData.user.banned ? 'text-red-600' : 'text-green-600'">
            {{ profileData.user.banned ? t('profile.stats.banned') : t('profile.stats.active') }}
          </p>
          <p class="text-red-500 text-xs mt-1">{{ t('profile.stats.status') }}</p>
        </div>
      </div>

      <!-- User Information & Edit Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Information -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-red-800">{{ t('profile.personal_info.title') }}</h2>
            <button 
              @click="toggleEditMode"
              class="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
            >
              {{ editMode ? t('profile.actions.cancel') : t('profile.actions.edit') }}
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!editMode" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-red-600 text-sm">{{ t('profile.personal_info.full_name') }}</p>
                <p class="text-red-800 font-medium">{{ profileData.user.name }}</p>
              </div>
              <div>
                <p class="text-red-600 text-sm">{{ t('auth.email') }}</p>
                <p class="text-red-800 font-medium">{{ profileData.user.email }}</p>
              </div>
              <div>
                <p class="text-red-600 text-sm">{{ t('profile.personal_info.phone') }}</p>
                <p class="text-red-800 font-medium">{{ profileData.user.phone || t('profile.personal_info.not_provided') }}</p>
              </div>
              <div>
                <p class="text-red-600 text-sm">{{ t('profile.personal_info.role') }}</p>
                <p class="text-red-800 font-medium capitalize">{{ profileData.user.role }}</p>
              </div>
            </div>
            
            <div v-if="profileData.user.role === 'seller' && profileData.user.companyName" class="mt-4">
              <p class="text-red-600 text-sm">{{ t('profile.personal_info.company') }}</p>
              <p class="text-red-800 font-medium">{{ profileData.user.companyName }}</p>
            </div>

            <div v-if="profileData.user.streetAddress || profileData.user.city" class="mt-4">
              <p class="text-red-600 text-sm">{{ t('profile.personal_info.address') }}</p>
              <p class="text-red-800 font-medium">
                {{ profileData.user.streetAddress || '' }}
                {{ profileData.user.streetAddress && profileData.user.city ? ',' : '' }}
                {{ profileData.user.city || '' }}
                {{ profileData.user.canton ? `, ${profileData.user.canton}` : '' }}
                {{ profileData.user.zipCode ? ` ${profileData.user.zipCode}` : '' }}
              </p>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else>
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.full_name') }}</label>
                  <input 
                    v-model="editForm.name"
                    type="text" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                    required
                  />
                </div>
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.phone') }}</label>
                  <input 
                    v-model="editForm.phone"
                    type="tel" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                  />
                </div>
              </div>

              <div v-if="profileData.user.role === 'seller'">
                <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.company_name') }}</label>
                <input 
                  v-model="editForm.companyName"
                  type="text" 
                  class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.street_address') }}</label>
                  <input 
                    v-model="editForm.streetAddress"
                    type="text" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                  />
                </div>
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.city') }}</label>
                  <input 
                    v-model="editForm.city"
                    type="text" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                  />
                </div>
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.canton') }}</label>
                  <input 
                    v-model="editForm.canton"
                    type="text" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                  />
                </div>
                <div>
                  <label class="block text-red-600 text-sm mb-2">{{ t('profile.personal_info.zip_code') }}</label>
                  <input 
                    v-model="editForm.zipCode"
                    type="text" 
                    class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  @click="toggleEditMode"
                  class="px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition-colors"
                >
                  {{ t('profile.actions.cancel') }}
                </button>
                <button 
                  type="submit"
                  :disabled="saving"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {{ saving ? t('profile.saving') : t('profile.actions.save_changes') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass p-6 rounded-xl border border-red-200">
          <h2 class="text-xl font-bold text-red-800 mb-4">{{ t('profile.quick_actions.title') }}</h2>
          <div class="space-y-4">
            <NuxtLink 
              v-if="profileData.user.role === 'seller'"
              to="/sell"
              class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span class="text-red-800 font-medium">{{ t('profile.quick_actions.list_new_car') }}</span>
              </div>
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NuxtLink>

            <NuxtLink 
              to="/dashboard"
              class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="text-red-800 font-medium">{{ t('profile.quick_actions.view_dashboard') }}</span>
              </div>
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </NuxtLink>

            <button 
              v-if="profileData.user.role === 'buyer' && !profileData.user.verifiedBuyer"
              @click="requestVerification"
              class="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <div>
                  <span class="text-red-800 font-medium">{{ t('profile.quick_actions.request_verification') }}</span>
                  <p class="text-red-600 text-sm mt-1">{{ t('profile.quick_actions.get_verified') }}</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- My Listings Section (For Sellers) -->
      <div v-if="profileData.user.role === 'seller'" class="glass p-6 rounded-xl border border-red-200">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-red-800">{{ t('profile.my_listings.title') }}</h2>
          <NuxtLink 
            to="/sell"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            + {{ t('profile.my_listings.new_listing') }}
          </NuxtLink>
        </div>

        <!-- Loading state for listings -->
        <div v-if="listingsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p class="text-red-600 mt-4">{{ t('profile.my_listings.loading') || 'Loading your listings...' }}</p>
        </div>

        <!-- Listings Grid -->
        <div v-else-if="userListings.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="car in userListings" 
            :key="car.id"
            class="bg-white border border-red-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <!-- Car Image -->
            <div class="h-48 bg-red-100 relative">
              <img 
                v-if="car.images && car.images[0]"
                :src="car.images[0]"
                :alt="`${car.make} ${car.model}`"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              
              <!-- Status Badge -->
              <div class="absolute top-3 left-3">
                <span :class="getStatusClass(car.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getStatusDisplay(car.status, car.listingType) }}
                </span>
              </div>
              
              <!-- Featured Badge -->
              <div v-if="car.isFeatured && car.featuredUntil && new Date(car.featuredUntil) > new Date()" 
                   class="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                ⭐ {{ t('profile.featured') }}
              </div>
            </div>
            
            <!-- Car Info -->
            <div class="p-4">
              <h3 class="text-lg font-bold text-red-800 mb-1">{{ car.make }} {{ car.model }}</h3>
              <p class="text-red-600 text-sm mb-3">{{ car.year }} • {{ car.mileage.toLocaleString() }} km</p>
              
              <div class="flex justify-between items-center mb-4">
                <div>
                  <p class="text-2xl font-bold text-red-800">
                    {{ car.listingType === 'auction' && car.currentBid ? `${car.currentBid} ${t('currency.chf')}` : `${car.price} ${t('currency.chf')}` }}
                  </p>
                  <p v-if="car.listingType === 'auction'" class="text-red-500 text-sm">
                    {{ car.bidCount || 0 }} {{ t('auction.bids_count') || 'bids' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-red-600 text-sm">{{ car.city }}, {{ car.canton }}</p>
                  <p class="text-red-500 text-xs">{{ formatDate(car.createdAt) }}</p>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex space-x-2">
                <NuxtLink 
                  :to="`/cars/${car.id}`"
                  class="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg hover:bg-red-200 text-center"
                >
                  {{ t('messages.view') }}
                </NuxtLink>
                <NuxtLink 
                  :to="`/seller/cars/edit/${car.id}`"
                  class="px-3 py-2 bg-red-200 text-red-800 text-sm font-medium rounded-lg hover:bg-red-300"
                >
                  {{ t('profile.actions.edit') }}
                </NuxtLink>
                <button 
                  @click="confirmDelete(car.id)"
                  class="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                >
                  {{ t('profile.actions.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state for listings -->
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <p class="text-red-600 mb-4">{{ t('profile.my_listings.empty') }}</p>
          <NuxtLink 
            to="/sell" 
            class="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200"
          >
            {{ t('profile.my_listings.list_first_car') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="glass p-6 rounded-xl border border-red-200">
        <h2 class="text-xl font-bold text-red-800 mb-4">{{ t('profile.recent_activity.title') }}</h2>
        <div v-if="profileData.activity.length > 0" class="space-y-3">
          <div v-for="item in profileData.activity" :key="item.id" class="border-b border-red-200 pb-3 last:border-b-0">
            <p class="text-red-800">{{ item.message }}</p>
            <p class="text-red-600 text-sm">{{ formatActivityDate(item.date) }}</p>
          </div>
        </div>
        <p v-else class="text-red-600">{{ t('profile.recent_activity.empty') }}</p>
      </div>

      <!-- Transaction History Section -->
      <div class="glass p-6 rounded-xl border border-red-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-red-800">{{ t('profile.transactions.title') }}</h2>
          <button 
            @click="refreshTransactions"
            class="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
            :disabled="transactionsLoading"
          >
            <svg v-if="transactionsLoading" class="animate-spin h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>{{ t('profile.transactions.refresh') }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="transactionsLoading && transactions.length === 0" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p class="text-red-600 text-sm mt-2">{{ t('profile.transactions.loading') || 'Loading transactions...' }}</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="transactions.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-red-600">{{ t('profile.transactions.empty') }}</p>
          <p class="text-red-500 text-sm mt-1">{{ t('profile.transactions.empty_description') }}</p>
        </div>

        <!-- Transactions List -->
        <div v-else class="space-y-4">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-red-800">{{ formatTransactionType(transaction.type) }}</span>
                  <span :class="getTransactionStatusClass(transaction)" class="px-2 py-0.5 text-xs rounded-full">
                    {{ transaction.status || 'completed' }}
                  </span>
                </div>
                <p class="text-red-600 text-sm">{{ formatDate(transaction.createdAt) }}</p>
                <p v-if="transaction.description" class="text-red-500 text-sm mt-1">
                  {{ transaction.description }}
                </p>
                <div v-if="transaction.metadata" class="text-red-400 text-xs mt-1">
                  <span v-if="transaction.metadata.carMake">
                    {{ transaction.metadata.carMake }} {{ transaction.metadata.carModel }}
                  </span>
                  <span v-if="transaction.metadata.listingType">
                    • {{ transaction.metadata.listingType }}
                  </span>
                  <span v-if="transaction.metadata.featureType">
                    • {{ transaction.metadata.featureType }} {{ t('profile.transactions.feature') || 'feature' }}
                  </span>
                </div>
                <p v-if="transaction.referenceId" class="text-red-300 text-xs mt-1">
                  {{ t('profile.transactions.reference') || 'Ref' }}: {{ transaction.referenceId }}
                </p>
              </div>
              <div class="text-right ml-4">
                <!-- FIXED: Show transaction change amount, not new balance -->
                <p class="font-bold text-lg" :class="getAmountClass(transaction)">
                  {{ getAmountPrefix(transaction) }}{{ Math.abs(transaction.amount) }} {{ t('currency.chf') }}
                  <span class="text-xs font-normal text-gray-500 block">
                    {{ t('profile.transactions.change') || 'Change' }}: {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} {{ t('currency.chf') }}
                  </span>
                </p>
                <p class="text-red-600 text-sm">{{ t('profile.transactions.new_balance') || 'New balance' }}: {{ transaction.newBalance }} {{ t('currency.chf') }}</p>
                <p class="text-red-400 text-xs">
                  {{ t('profile.transactions.was') || 'Was' }}: {{ transaction.previousBalance }} {{ t('currency.chf') }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Summary -->
          <div v-if="transactions.length > 0" class="mt-6 pt-6 border-t border-red-200">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-red-600 text-sm">{{ t('profile.transactions.total_transactions') }}</p>
                <p class="text-lg font-bold text-red-800">{{ transactions.length }}</p>
              </div>
              <div class="text-center">
                <p class="text-red-600 text-sm">{{ t('profile.transactions.money_in') }}</p>
                <p class="text-lg font-bold text-green-600">
                  +{{ transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2) }} {{ t('currency.chf') }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-red-600 text-sm">{{ t('profile.transactions.money_out') }}</p>
                <p class="text-lg font-bold text-red-600">
                  -{{ Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toFixed(2) }} {{ t('currency.chf') }}
                </p>
              </div>
              <div class="text-center">
                <p class="text-red-600 text-sm">{{ t('profile.transactions.net_change') }}</p>
                <p class="text-lg font-bold" :class="transactions.reduce((sum, t) => sum + t.amount, 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ transactions.reduce((sum, t) => sum + t.amount, 0) >= 0 ? '+' : '' }}
                  {{ transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2) }} {{ t('currency.chf') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Set SEO meta tags
useHead({
  title: t('profile.seo.title') || 'Your Profile - SwissExportCar',
  meta: [
    {
      name: 'description',
      content: t('profile.seo.description') || 'View and manage your profile, listings, and transaction history on SwissExportCar'
    }
  ]
})

const loading = ref(true)
const listingsLoading = ref(false)
const error = ref('')
const editMode = ref(false)
const saving = ref(false)
const userListings = ref([])

// Transaction history
const transactionsLoading = ref(false)
const transactions = ref([])

// Profile data
const profileData = ref({
  user: {
    id: null,
    name: '',
    email: '',
    role: '',
    joinedAt: new Date().toISOString(),
    funds: 0,
    banned: false,
    phone: '',
    companyName: '',
    streetAddress: '',
    city: '',
    canton: '',
    zipCode: '',
    verifiedBuyer: false
  },
  stats: {
    totalListings: 0,
    activeListings: 0,
    carsSold: 0
  },
  activity: []
})

// Edit form
const editForm = ref({
  name: '',
  phone: '',
  companyName: '',
  streetAddress: '',
  city: '',
  canton: '',
  zipCode: ''
})

// Fetch profile data
const { data, pending, error: fetchError } = await useLazyFetch('/api/user/profile', {
  key: 'profile-data',
  onResponseError({ response }) {
    if (response.status === 401) {
      navigateTo('/login')
    }
  }
})

// Watch for data changes
watchEffect(() => {
  if (data.value) {
    profileData.value = data.value
    // Initialize edit form with current data
    editForm.value = {
      name: profileData.value.user.name,
      phone: profileData.value.user.phone || '',
      companyName: profileData.value.user.companyName || '',
      streetAddress: profileData.value.user.streetAddress || '',
      city: profileData.value.user.city || '',
      canton: profileData.value.user.canton || '',
      zipCode: profileData.value.user.zipCode || ''
    }
  }
  loading.value = pending.value
  error.value = fetchError.value?.message || ''
})

// Fetch user's listings if seller
watchEffect(async () => {
  if (profileData.value.user.role === 'seller' && profileData.value.user.id) {
    listingsLoading.value = true
    try {
      const { data: listings } = await useFetch('/api/cars/my')
      userListings.value = listings.value || []
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      listingsLoading.value = false
    }
  }
})

// Load transactions
const loadTransactions = async () => {
  transactionsLoading.value = true
  try {
    const { data } = await useFetch('/api/user/transactions', {
      key: `user-transactions-${Date.now()}`
    })
    
    console.log('📊 Transactions API response:', data.value) // DEBUG
    
    if (data.value?.success) {
      transactions.value = data.value.transactions || []
      
      // Debug: Log transaction amounts
      transactions.value.forEach((t: any, index: number) => {
        console.log(`Transaction ${index + 1}:`, {
          id: t.id,
          type: t.type,
          amount: t.amount,
          previousBalance: t.previousBalance,
          newBalance: t.newBalance,
          description: t.description
        })
      })
    } else {
      console.error('❌ Failed to load transactions:', data.value?.error)
    }
  } catch (err: any) {
    console.error('❌ Failed to load transactions:', err)
    console.error('❌ Error details:', err.message)
  } finally {
    transactionsLoading.value = false
  }
}

const refreshTransactions = async () => {
  await loadTransactions()
}

// Helper functions for transactions
const getTransactionDescription = (transaction: any) => {
  const typeMap: Record<string, string> = {
    'deposit': 'Funds Added',
    'withdrawal': 'Funds Withdrawn',
    'payment': 'Payment',
    'refund': 'Refund'
  }
  return typeMap[transaction.type] || transaction.type || 'Transaction'
}

const getAmountClass = (transaction: any) => {
  return transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
}

const getAmountPrefix = (transaction: any) => {
  return transaction.amount > 0 ? '+' : '-'
}

// Format transaction type for display
const formatTransactionType = (type: string) => {
  const typeMap: Record<string, string> = {
    'deposit': t('profile.transactions.type.deposit') || 'Deposit',
    'withdrawal': t('profile.transactions.type.withdrawal') || 'Withdrawal',
    'payment': t('profile.transactions.type.payment') || 'Payment',
    'refund': t('profile.transactions.type.refund') || 'Refund',
    'listing_fee': t('profile.transactions.type.listing_fee') || 'Listing Fee',
    'auction_fee': t('profile.transactions.type.auction_fee') || 'Auction Fee',
    'feature_payment': t('profile.transactions.type.feature_payment') || 'Feature',
    'permanent_feature_payment': t('profile.transactions.type.permanent_feature_payment') || 'Permanent Feature',
    'bid_payment': t('profile.transactions.type.bid_payment') || 'Bid',
    'admin_adjustment': t('profile.transactions.type.admin_adjustment') || 'Admin Adjustment',
    'free_feature': t('profile.transactions.type.free_feature') || 'Free Feature'
  }
  return typeMap[type] || type
}

const getTransactionStatusClass = (transaction: any) => {
  switch (transaction.status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Computed properties
const userInitial = computed(() => profileData.value.user.name?.charAt(0)?.toUpperCase() || '?')
const formattedJoinDate = computed(() => new Date(profileData.value.user.joinedAt).toLocaleDateString())

// Format dates
const formatActivityDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Status class helper
const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sold':
      return 'bg-red-100 text-red-800'
    case 'auction':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Status display helper
const getStatusDisplay = (status: string, listingType?: string) => {
  if (listingType === 'auction') {
    switch (status?.toLowerCase()) {
      case 'active': return t('auction.status.live') || 'Live Auction'
      case 'auction_ended': return t('auction.status.ended') || 'Auction Ended'
      case 'sold': return t('auction.status.sold') || 'Sold'
      default: return t('auction.status.auction') || 'Auction'
    }
  } else {
    switch (status?.toLowerCase()) {
      case 'active': return t('status_label.active') || 'Available'
      case 'sold': return t('auction.status.sold') || 'Sold'
      default: return t('status_label.active') || 'Available'
    }
  }
}

// Toggle edit mode
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    // Reset form to current values
    editForm.value = {
      name: profileData.value.user.name,
      phone: profileData.value.user.phone || '',
      companyName: profileData.value.user.companyName || '',
      streetAddress: profileData.value.user.streetAddress || '',
      city: profileData.value.user.city || '',
      canton: profileData.value.user.canton || '',
      zipCode: profileData.value.user.zipCode || ''
    }
  }
}

// Save profile
const saveProfile = async () => {
  saving.value = true
  try {
    const { data: result } = await useFetch('/api/user/profile', {
      method: 'PUT',
      body: editForm.value
    })
    
    if (result.value?.success) {
      // Update local data
      profileData.value.user = {
        ...profileData.value.user,
        ...editForm.value
      }
      editMode.value = false
      alert(t('profile.messages.updated_success') || 'Profile updated successfully!')
    }
  } catch (err) {
    console.error('Failed to update profile:', err)
    alert(t('profile.messages.update_failed') || 'Failed to update profile. Please try again.')
  } finally {
    saving.value = false
  }
}

// Delete listing
const confirmDelete = async (carId: number) => {
  console.log('🗑️ Attempting to delete car ID:', carId)
  
  if (confirm(t('profile.messages.confirm_delete') || 'Are you sure you want to delete this listing? This action cannot be undone.')) {
    try {
      // Try the new endpoint
      const result = await $fetch(`/api/cars/${carId}/delete`, {
        method: 'DELETE'
      })
      
      console.log('✅ Delete response:', result)
      
      // Remove from local list
      userListings.value = userListings.value.filter((car: any) => car.id !== carId)
      alert(t('profile.messages.delete_success') || 'Listing deleted successfully!')
      
    } catch (error: any) {
      console.error('❌ Failed to delete listing:', error)
      console.error('❌ Error details:', error.data)
      
      alert(t('profile.messages.delete_failed') || 'Failed to delete listing: ' + 
        (error.data?.message || error.message || 'Please try again'))
    }
  }
}

// Request verification
const requestVerification = async () => {
  if (confirm(t('profile.messages.confirm_verification') || 'Request verification as a buyer? This will notify the admin team.')) {
    try {
      const { data } = await useFetch('/api/user/request-verification', {
        method: 'POST'
      })
      
      if (data.value?.success) {
        alert(t('profile.messages.verification_sent') || 'Verification request sent! Our team will review your request soon.')
      }
    } catch (error) {
      console.error('Failed to request verification:', error)
      alert(t('profile.messages.verification_failed') || 'Failed to send verification request. Please try again.')
    }
  }
}

// Load transactions on mount
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.glass {
  @apply bg-white/70 backdrop-blur-md border border-red-200;
}
</style>
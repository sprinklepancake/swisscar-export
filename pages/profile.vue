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
      <NuxtLink :to="localePath('/login')" class="text-red-800 hover:underline mt-2 inline-block">
        {{ t('profile.error.login_to_view') || 'Please login to view your profile' }}
      </NuxtLink>
    </div>

    <!-- Profile content -->
    <div v-else class="space-y-8">
      <!-- Account status. An account is usable the moment it is created, so
           this is normally just a green tick — the amber state now means an
           administrator has RESTRICTED the account, not that it is queued. -->
      <div
        class="rounded-xl border p-5"
        :class="profileData.user.banned
          ? 'bg-red-50 border-red-300'
          : profileData.user.verified
            ? 'bg-green-50 border-green-300'
            : 'bg-amber-50 border-amber-300'"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl leading-none">
            {{ profileData.user.banned ? '⛔' : profileData.user.verified ? '✅' : '⏳' }}
          </span>
          <div class="min-w-0">
            <p
              class="font-semibold"
              :class="profileData.user.banned ? 'text-red-900' : profileData.user.verified ? 'text-green-900' : 'text-amber-900'"
            >
              {{ profileData.user.banned
                ? t('profile.status.banned_title')
                : profileData.user.verified
                  ? t('profile.status.verified_title')
                  : t('profile.status.pending_title') }}
            </p>
            <p
              class="text-sm mt-1"
              :class="profileData.user.banned ? 'text-red-700' : profileData.user.verified ? 'text-green-700' : 'text-amber-800'"
            >
              {{ profileData.user.banned
                ? t('profile.status.banned_body')
                : profileData.user.verified
                  ? (profileData.user.role === 'seller' ? t('profile.status.verified_body_seller') : t('profile.status.verified_body_buyer'))
                  : t('profile.status.pending_body') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Auction access. THE one place an ID document is still needed, and the
           only thing on the site an administrator approves by hand. Signing up,
           listing a car and messaging a seller all work without any of this.
           Hidden for a RESTRICTED account (verified = false): requireVerified()
           rejects those before auction access is ever consulted, so a green
           "you can bid on any live auction" card directly under the red
           "account restricted" card was simply false. The status card above
           already explains the situation. -->
      <div
        v-if="!profileData.user.banned && profileData.user.verified"
        class="rounded-xl border p-5"
        :class="auctionState === 'approved'
          ? 'bg-green-50 border-green-300'
          : auctionState === 'pending'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-red-200'"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl leading-none">
            {{ auctionState === 'approved' ? '🏆' : auctionState === 'pending' ? '⏳' : '🔒' }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold"
               :class="auctionState === 'approved' ? 'text-green-900' : auctionState === 'pending' ? 'text-amber-900' : 'text-red-800'">
              {{ t('profile.auction.title') }} —
              {{ auctionState === 'approved'
                ? t('profile.auction.approved_title')
                : auctionState === 'pending'
                  ? t('profile.auction.pending_title')
                  : t('profile.auction.none_title') }}
            </p>
            <p class="text-sm mt-1"
               :class="auctionState === 'approved' ? 'text-green-700' : auctionState === 'pending' ? 'text-amber-800' : 'text-red-600'">
              {{ auctionState === 'approved'
                ? t('profile.auction.approved_body')
                : auctionState === 'pending'
                  ? t('profile.auction.pending_body')
                  : t('profile.auction.none_body') }}
            </p>
          </div>
        </div>

        <!-- Upload / replace the document, then ask for approval. -->
        <div v-if="auctionState !== 'approved'" class="mt-4 pt-4 border-t"
             :class="auctionState === 'pending' ? 'border-amber-200' : 'border-red-200'">
          <label class="block text-sm font-medium mb-2"
                 :class="auctionState === 'pending' ? 'text-amber-900' : 'text-red-700'">
            {{ profileData.user.hasIdDocument ? t('profile.auction.replace_label') : t('profile.auction.upload_label') }}
          </label>
          <input
            type="file"
            accept="image/*,application/pdf,.pdf"
            :disabled="uploadingId"
            @change="onIdUpload"
            class="block w-full text-sm text-red-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-800 hover:file:bg-red-200"
          />
          <p v-if="idUploadMessage" class="text-sm mt-2" :class="idUploadError ? 'text-red-700' : 'text-green-700'">
            {{ idUploadMessage }}
          </p>

          <button
            v-if="profileData.user.hasIdDocument && auctionState !== 'pending'"
            @click="requestAuctionAccess"
            :disabled="requestingAuction"
            class="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ requestingAuction ? t('profile.auction.requesting') : t('profile.auction.request_button') }}
          </button>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-red-100 to-red-200 rounded-xl p-6 border border-red-300">
        <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
            <div class="relative flex-shrink-0">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full flex items-center justify-center">
                <span class="text-3xl font-bold text-white">{{ userInitial }}</span>
              </div>
            </div>
            <div class="text-center sm:text-left">
              <h1 class="text-xl sm:text-2xl font-bold text-red-800">{{ profileData.user.name }}</h1>
              <p class="text-red-700 flex items-center gap-2">
                <!-- This used to read "Verified Seller" for every seller, including
                     ones an admin had not approved yet. -->
                <span class="capitalize">{{ roleLabel }}</span>
                <span v-if="profileData.user.verifiedBuyer" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✓ {{ t('profile.verified') }}
                </span>
              </p>
              <p class="text-red-600 text-sm mt-1">{{ t('profile.member_since') }} {{ formattedJoinDate }}</p>
            </div>
          </div>
          
          <!-- Account Balance -->
          <div class="w-full sm:w-auto sm:min-w-[200px] bg-white/50 rounded-lg p-4 text-center border border-red-200 mt-2 sm:mt-0">
            <p class="text-red-600 text-sm">{{ t('profile.account_balance') }}</p>
            <p class="text-2xl font-bold text-red-800">{{ profileData.user.funds || 0 }} {{ t('currency.chf') }}</p>
            <p class="text-red-500 text-xs mt-1">{{ t('profile.contact_admin_funds') || 'Contact admin for fund management' }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <!-- Buyers used to be shown three seller-only counters permanently stuck
           at 0, while the one figure computed for them (watchlist) was never
           displayed at all. -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <template v-if="profileData.user.role === 'seller'">
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
        </template>
        <template v-else>
          <div class="glass p-4 rounded-lg border border-red-200">
            <p class="text-red-600 text-sm">{{ t('profile.stats.watchlist') }}</p>
            <p class="text-2xl font-bold text-red-800">{{ profileData.stats.watchlistCount || 0 }}</p>
            <p class="text-red-500 text-xs mt-1">{{ t('profile.stats.saved_cars') }}</p>
          </div>
          <div class="glass p-4 rounded-lg border border-red-200">
            <p class="text-red-600 text-sm">{{ t('profile.stats.buyer_type') }}</p>
            <p class="text-lg font-bold text-red-800 capitalize">
              {{ profileData.user.buyerType === 'auction' ? t('register.buyer_type_auction_short') : t('register.buyer_type_direct_short') }}
            </p>
            <p class="text-red-500 text-xs mt-1">{{ t('profile.personal_info.role') }}</p>
          </div>
        </template>
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div class="flex justify-end gap-3 pt-4">
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
              :to="localePath('/sell')"
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
              :to="localePath('/dashboard')"
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

            <!-- The old "Verification Status Banner" and "Request
                 Verification" button lived here. Both described a queue that no
                 longer exists — an account is active from the moment it is
                 created. The one thing that IS still reviewed, auction access,
                 has its own card at the top of this page, so duplicating it
                 here only made people think they were waiting for something. -->
          </div>
        </div>
      </div>

      <!-- Change password — there was no way at all to do this before -->
      <div class="glass p-6 rounded-xl border border-red-200">
        <h2 class="text-xl font-bold text-red-800 mb-4">{{ t('profile.password.title') }}</h2>

        <form @submit.prevent="changePassword" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            <label for="currentPassword" class="block text-red-600 text-sm mb-2">{{ t('profile.password.current') }}</label>
            <input
              id="currentPassword"
              v-model="passwordForm.current"
              type="password"
              autocomplete="current-password"
              required
              class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-red-600 text-sm mb-2">{{ t('auth.new_password') }}</label>
            <input
              id="newPassword"
              v-model="passwordForm.next"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
              class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
            />
          </div>
          <div>
            <label for="confirmNewPassword" class="block text-red-600 text-sm mb-2">{{ t('register.password.confirm_label') }}</label>
            <input
              id="confirmNewPassword"
              v-model="passwordForm.confirm"
              type="password"
              autocomplete="new-password"
              required
              class="w-full bg-red-50 rounded-lg px-4 py-2 text-red-900 border border-red-300"
            />
          </div>

          <div class="md:col-span-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              :disabled="changingPassword"
              class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ changingPassword ? t('profile.saving') : t('profile.password.submit') }}
            </button>
            <p v-if="passwordMessage" class="text-sm" :class="passwordError ? 'text-red-700' : 'text-green-700'">
              {{ passwordMessage }}
            </p>
            <NuxtLink :to="localePath('/forgot-password')" class="text-sm text-red-700 hover:text-red-900 underline sm:ml-auto">
              {{ t('auth.forgot_password') }}
            </NuxtLink>
          </div>
        </form>
        <p class="text-red-500 text-xs mt-3">{{ t('profile.password.hint') }}</p>
      </div>

      <!-- My Listings Section (For Sellers) -->
      <div v-if="profileData.user.role === 'seller'" class="glass p-6 rounded-xl border border-red-200">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h2 class="text-xl font-bold text-red-800">{{ t('profile.my_listings.title') }}</h2>
          <NuxtLink 
            :to="localePath('/sell')"
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
                loading="lazy"
                decoding="async"
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
              <p class="text-red-600 text-sm mb-3">{{ car.year }} • {{ Number(car.mileage || 0).toLocaleString() }} km</p>
              
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
              <div class="flex flex-wrap gap-2 mt-3">
                <NuxtLink 
                  :to="localePath(`/cars/${car.id}`)"
                  class="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg hover:bg-red-200 text-center min-w-0"
                >
                  {{ t('messages.view') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath(`/cars/edit/${car.id}`)"
                  class="flex-1 px-3 py-2 bg-red-200 text-red-800 text-sm font-medium rounded-lg hover:bg-red-300 text-center min-w-0"
                >
                  {{ t('profile.actions.edit') }}
                </NuxtLink>
                <button 
                  @click="confirmDelete(car.id)"
                  class="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 min-w-0"
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
            :to="localePath('/sell')" 
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
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
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
              <div class="sm:text-right ml-0 sm:ml-4 flex-shrink-0">
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
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
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
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS PAGE WAS BROKEN
//
//  • The profile was loaded with useLazyFetch(), which runs during SSR. Nuxt
//    does NOT forward the browser's cookies to internal API calls during SSR,
//    so /api/user/profile answered 401 and the page rendered its "please
//    login" error to users who were very much logged in.
//  • saveProfile(), loadTransactions() and requestVerification() all called
//    useFetch() from inside a click handler. useFetch() is a setup-time
//    composable; used that way it silently returns stale/never-resolving data,
//    which is why saving a profile appeared to do nothing.
//
// Everything now goes through apiFetch(), which runs on the client with a
// freshly refreshed Supabase token.
// ─────────────────────────────────────────────────────────────────────────────
const { t } = useI18n()
const localePath = useLocalePath()
const { apiFetch } = useApiFetch()
const auth = useAuth()
const route = useRoute()

useHead({
  title: t('profile.seo.title'),
  meta: [{ name: 'description', content: t('profile.seo.description') }]
})

const loading = ref(true)
const listingsLoading = ref(false)
const error = ref('')
const editMode = ref(false)
const saving = ref(false)
const userListings = ref<any[]>([])

const transactionsLoading = ref(false)
const transactions = ref<any[]>([])

const emptyProfile = () => ({
  user: {
    id: null, name: '', email: '', role: '', joinedAt: new Date().toISOString(),
    funds: 0, verified: false, verifiedBuyer: false, banned: false, phone: '', companyName: '',
    businessType: '', streetAddress: '', city: '', canton: '', zipCode: '',
    profileImage: '', freeFeatureCredits: 0, buyerType: 'direct', hasIdDocument: false,
  },
  stats: { totalListings: 0, activeListings: 0, carsSold: 0, watchlistCount: 0 },
  activity: [] as any[],
})

const profileData = ref<any>(emptyProfile())

const editForm = ref({
  name: '', phone: '', companyName: '', streetAddress: '', city: '', canton: '', zipCode: ''
})

const syncEditForm = () => {
  const u = profileData.value.user
  editForm.value = {
    name: u.name || '',
    phone: u.phone || '',
    companyName: u.companyName || '',
    streetAddress: u.streetAddress || '',
    city: u.city || '',
    canton: u.canton || '',
    zipCode: u.zipCode || ''
  }
}

const loadProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const data: any = await apiFetch('/api/user/profile')
    profileData.value = {
      user: { ...emptyProfile().user, ...(data.user || {}) },
      stats: { ...emptyProfile().stats, ...(data.stats || {}) },
      activity: data.activity || [],
    }
    userListings.value = data.listings || []
    syncEditForm()
  } catch (err: any) {
    if (err?.statusCode === 401 || err?.response?.status === 401) {
      await navigateTo(localePath(`/login?redirect=${encodeURIComponent(route.fullPath)}`))
      return
    }
    error.value = err?.data?.statusMessage || t('profile.error.load_failed')
  } finally {
    loading.value = false
    listingsLoading.value = false
  }
}

// ── Transactions ────────────────────────────────────────────────────────────
const loadTransactions = async () => {
  transactionsLoading.value = true
  try {
    const data: any = await apiFetch('/api/user/transactions')
    transactions.value = data?.transactions || []
  } catch {
    transactions.value = []
  } finally {
    transactionsLoading.value = false
  }
}

const refreshTransactions = () => loadTransactions()

// ── Auction access ──────────────────────────────────────────────────────────
// The only capability on the site that still needs an ID document and a human
// approval. Registering, listing a car and messaging a seller need none of it.
//
//   'approved' — an admin checked the ID; the account can bid.
//   'pending'  — a document is on file and the account has asked to join.
//   'none'     — never asked, or no document uploaded yet.
const auctionState = computed<'approved' | 'pending' | 'none'>(() => {
  const u = profileData.value.user
  if (u.verifiedBuyer) return 'approved'
  if (u.hasIdDocument && u.buyerType === 'auction') return 'pending'
  return 'none'
})

const requestingAuction = ref(false)

const requestAuctionAccess = async () => {
  if (!profileData.value.user.hasIdDocument) {
    idUploadError.value = true
    idUploadMessage.value = t('profile.auction.upload_first')
    return
  }
  requestingAuction.value = true
  idUploadError.value = false
  idUploadMessage.value = ''
  try {
    const data: any = await apiFetch('/api/user/request-auction-access', { method: 'POST' })
    idUploadMessage.value = data?.message || t('profile.auction.request_sent')
    // Move the card into its 'pending' state without a full reload.
    profileData.value.user.buyerType = 'auction'
    if (data?.alreadyApproved) profileData.value.user.verifiedBuyer = true
  } catch (err: any) {
    idUploadError.value = true
    idUploadMessage.value = err?.data?.statusMessage || t('profile.auction.request_failed')
  } finally {
    requestingAuction.value = false
  }
}

// ── ID document upload ──────────────────────────────────────────────────────
const uploadingId = ref(false)
const idUploadMessage = ref('')
const idUploadError = ref(false)
const { compressImage } = useImageCompression()

const onIdUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  idUploadMessage.value = ''
  idUploadError.value = false

  // Accept any image (iPhones send HEIC) or a PDF; compressImage() converts
  // images to JPEG, and only then do we check what we are really sending.
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  const isImage = file.type.startsWith('image/')
  if (!isImage && file.type !== 'application/pdf') {
    idUploadError.value = true
    idUploadMessage.value = t('register.validation.id_file_type')
    target.value = ''
    return
  }

  uploadingId.value = true
  try {
    let prepared: File = file
    if (isImage) {
      prepared = await compressImage(file, { maxDimension: 2000, quality: 0.85, skipUnderKB: 0 })
    }
    if (!allowed.includes(prepared.type)) {
      idUploadError.value = true
      idUploadMessage.value = t('register.validation.id_file_type')
      return
    }
    const fd = new FormData()
    fd.append('file', prepared)
    await apiFetch('/api/user/upload-id', { method: 'POST', body: fd })
    idUploadMessage.value = t('profile.status.id_uploaded')
    profileData.value.user.hasIdDocument = true
    // Uploading a document IS the request to be let into auctions — there is no
    // other reason to send one — so queue it in the same step rather than
    // leaving the user to find a second button.
    try {
      await apiFetch('/api/user/request-auction-access', { method: 'POST' })
      profileData.value.user.buyerType = 'auction'
    } catch {
      // The document is stored either way; the user can retry with the button.
    }
  } catch (err: any) {
    idUploadError.value = true
    idUploadMessage.value = err?.data?.statusMessage || t('profile.status.id_upload_failed')
  } finally {
    uploadingId.value = false
    target.value = ''
  }
}

// ── Change password ─────────────────────────────────────────────────────────
const passwordForm = ref({ current: '', next: '', confirm: '' })
const changingPassword = ref(false)
const passwordMessage = ref('')
const passwordError = ref(false)

const changePassword = async () => {
  passwordMessage.value = ''
  passwordError.value = false

  if (passwordForm.value.next.length < 8) {
    passwordError.value = true
    passwordMessage.value = t('register.validation.password_length')
    return
  }
  if (passwordForm.value.next !== passwordForm.value.confirm) {
    passwordError.value = true
    passwordMessage.value = t('register.validation.passwords_not_match')
    return
  }

  changingPassword.value = true
  try {
    await apiFetch('/api/user/change-password', {
      method: 'POST',
      body: { currentPassword: passwordForm.value.current, newPassword: passwordForm.value.next },
    })
    passwordMessage.value = t('auth.password_changed')
    passwordForm.value = { current: '', next: '', confirm: '' }
  } catch (err: any) {
    passwordError.value = true
    passwordMessage.value = err?.data?.statusMessage || t('auth.password_change_failed')
  } finally {
    changingPassword.value = false
  }
}

// ── Display helpers ─────────────────────────────────────────────────────────
const formatTransactionType = (type: string) => {
  const key = `profile.transactions.type.${type}`
  const translated = t(key)
  return translated === key ? type : translated
}

const getAmountClass = (transaction: any) => (transaction.amount > 0 ? 'text-green-600' : 'text-red-600')
const getAmountPrefix = (transaction: any) => (transaction.amount > 0 ? '+' : '-')

const getTransactionStatusClass = (transaction: any) => {
  switch (transaction.status?.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'refunded': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const roleLabel = computed(() => {
  const u = profileData.value.user
  if (u.role === 'admin') return t('profile.role.administrator')
  // "Verified" is now about the ID check, which only auction accounts go
  // through. Every seller is `verified` from signup, so keying the label off
  // that flag would have relabelled all of them "Verified Seller" — the exact
  // overclaim this label was rewritten to avoid.
  if (u.role === 'seller') return u.verifiedBuyer ? t('profile.role.verified_seller') : t('profile.role.seller')
  return u.verifiedBuyer ? t('profile.role.verified_buyer') : t('profile.role.registered_buyer')
})

const userInitial = computed(() => profileData.value.user.name?.charAt(0)?.toUpperCase() || '?')
const formattedJoinDate = computed(() => {
  const raw = profileData.value.user.joinedAt
  const date = raw ? new Date(raw) : null
  return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '—'
})

const formatActivityDate = (dateString: string) => {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? '' : date.toLocaleString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'sold': return 'bg-red-100 text-red-800'
    case 'auction': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDisplay = (status: string, listingType?: string) => {
  if (listingType === 'auction') {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'auction': return t('auction.status.live')
      case 'auction_ended': return t('auction.status.ended')
      case 'sold': return t('auction.status.sold')
      default: return t('auction.status.auction')
    }
  }
  switch (status?.toLowerCase()) {
    case 'sold': return t('auction.status.sold')
    default: return t('status_label.active')
  }
}

// ── Actions ─────────────────────────────────────────────────────────────────
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) syncEditForm()
}

const saveProfile = async () => {
  saving.value = true
  try {
    await apiFetch('/api/user/profile', { method: 'PUT', body: editForm.value })
    profileData.value.user = { ...profileData.value.user, ...editForm.value }
    editMode.value = false
    // Keep the header/nav in step with the new name.
    await auth.refreshUser()
  } catch (err: any) {
    alert(err?.data?.statusMessage || t('profile.messages.update_failed'))
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (carId: number) => {
  if (!confirm(t('profile.messages.confirm_delete'))) return
  try {
    await apiFetch(`/api/cars/${carId}/delete`, { method: 'DELETE' })
    userListings.value = userListings.value.filter((car: any) => car.id !== carId)
    profileData.value.stats.totalListings = Math.max(0, (profileData.value.stats.totalListings || 1) - 1)
  } catch (err: any) {
    alert(err?.data?.statusMessage || t('profile.messages.delete_failed'))
  }
}

onMounted(async () => {
  await loadProfile()
  await loadTransactions()
})
</script>


<style scoped>
.glass {
  @apply bg-white/70 backdrop-blur-md border border-red-200;
}
</style>
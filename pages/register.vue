<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
    <div class="glass p-8 rounded-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column (Form) -->
      <div>
        <h1 class="text-3xl font-bold text-center md:text-left text-red-800 mb-8">{{ t('auth.signup_title') }}</h1>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name and Email -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.name.label') }} *</label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.name.placeholder')"
              />
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-red-700 mb-1">{{ t('auth.email') }} *</label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.email')"
              />
            </div>
          </div>

          <!-- Role Selection (3 buttons) -->
          <div>
            <label class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.role_label') }} *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="setRole('direct_buyer')"
                :class="{
                  'bg-red-600 ring-2 ring-red-400 text-white': form.role === 'direct_buyer',
                  'bg-white/80 hover:bg-white text-red-800': form.role !== 'direct_buyer'
                }"
                class="p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-red-300 text-sm"
              >
                <svg v-if="form.role === 'direct_buyer'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ t('auth.role_direct_buyer') || 'Direct Buyer' }}
              </button>
              <button
                type="button"
                @click="setRole('auction_buyer')"
                :class="{
                  'bg-red-600 ring-2 ring-red-400 text-white': form.role === 'auction_buyer',
                  'bg-white/80 hover:bg-white text-red-800': form.role !== 'auction_buyer'
                }"
                class="p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-red-300 text-sm"
              >
                <svg v-if="form.role === 'auction_buyer'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ t('auth.role_auction_buyer') || 'Auction Buyer' }}
              </button>
              <button
                type="button"
                @click="setRole('seller')"
                :class="{
                  'bg-red-600 ring-2 ring-red-400 text-white': form.role === 'seller',
                  'bg-white/80 hover:bg-white text-red-800': form.role !== 'seller'
                }"
                class="p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-red-300 text-sm"
              >
                <svg v-if="form.role === 'seller'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ t('auth.role_seller') }}
              </button>
            </div>
          </div>

          <!-- Additional Seller Information -->
          <div v-if="form.role === 'seller'" class="space-y-4 border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 class="text-lg font-semibold text-red-800">{{ t('register.seller_info.title') }}</h3>
            
            <div>
              <label for="companyName" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.company_name') }}</label>
              <input
                v-model="form.companyName"
                type="text"
                id="companyName"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.seller_info.company_placeholder')"
              />
            </div>

            <div>
              <label for="businessType" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.business_type') }}</label>
              <select
                v-model="form.businessType"
                id="businessType"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">{{ t('register.seller_info.select_business_type') }}</option>
                <option value="private">{{ t('register.seller_info.private_seller') }}</option>
                <option value="dealer">{{ t('register.seller_info.car_dealer') }}</option>
                <option value="business">{{ t('register.seller_info.business') }}</option>
              </select>
            </div>

            <div>
              <label for="taxId" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.tax_id') }}</label>
              <input
                v-model="form.taxId"
                type="text"
                id="taxId"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.seller_info.tax_id_placeholder')"
              />
            </div>
          </div>

          <!-- Location Information (conditional) -->
          <div class="space-y-4">
            <!-- Seller: full address with Swiss canton -->
            <template v-if="form.role === 'seller'">
              <div>
                <label for="streetAddress" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.street_address') }}</label>
                <input
                  v-model="form.streetAddress"
                  type="text"
                  id="streetAddress"
                  class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  :placeholder="t('register.location.street_address_placeholder')"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="canton" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.canton') }}</label>
                  <select
                    v-model="form.canton"
                    id="canton"
                    class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">{{ t('register.location.select_canton') }}</option>
                    <option v-for="canton in cantons" :key="canton" :value="canton">{{ canton }}</option>
                  </select>
                </div>
                <div>
                  <label for="city" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.city') }}</label>
                  <input
                    v-model="form.city"
                    type="text"
                    id="city"
                    class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    :placeholder="t('register.location.city_placeholder')"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="zipCode" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.zip_code') }}</label>
                  <input
                    v-model="form.zipCode"
                    type="text"
                    id="zipCode"
                    class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    :placeholder="t('register.location.zip_code_placeholder')"
                  />
                </div>
                <!-- Country fixed for Swiss sellers -->
                <div>
                  <label for="country" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.country') }}</label>
                  <input
                    type="text"
                    disabled
                    value="Switzerland"
                    class="w-full p-3 bg-gray-100 border border-red-300 rounded-lg text-red-900 cursor-not-allowed"
                  />
                </div>
              </div>
            </template>

            <!-- Auction & Direct Buyer: country (any), city, zip only -->
            <template v-else>
              <div>
                <label for="country" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.country') }}</label>
                <select
                  v-model="form.country"
                  id="country"
                  class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Switzerland">{{ t('register.location.countries.switzerland') }}</option>
                  <option value="Germany">{{ t('register.location.countries.germany') }}</option>
                  <option value="France">{{ t('register.location.countries.france') }}</option>
                  <option value="Italy">{{ t('register.location.countries.italy') }}</option>
                  <option value="Austria">{{ t('register.location.countries.austria') }}</option>
                  <option value="Other">{{ t('register.location.countries.other') }}</option>
                </select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="city" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.city') }}</label>
                  <input
                    v-model="form.city"
                    type="text"
                    id="city"
                    class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    :placeholder="t('register.location.city_placeholder')"
                  />
                </div>
                <div>
                  <label for="zipCode" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.zip_code') }}</label>
                  <input
                    v-model="form.zipCode"
                    type="text"
                    id="zipCode"
                    class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    :placeholder="t('register.location.zip_code_placeholder')"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Phone Number (required for auction buyers and sellers) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-red-700 mb-1">
              {{ t('register.phone.label') }} 
              <span v-if="form.role !== 'direct_buyer'" class="text-red-500">*</span>
            </label>
            <input
              v-model="form.phone"
              type="tel"
              id="phone"
              :required="form.role !== 'direct_buyer'"
              class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :placeholder="t('register.phone.placeholder')"
              @input="formatPhoneNumber"
            />
          </div>

          <!-- Auction Buyer: ID Upload -->
          <div v-if="form.role === 'auction_buyer'" class="border border-red-200 rounded-lg p-4 bg-red-50">
            <label for="idDocument" class="block text-sm font-medium text-red-700 mb-1">
              {{ t('register.auction_buyer.id_document') || 'ID / Passport Upload' }}
            </label>
            <input
              type="file"
              id="idDocument"
              accept="image/*,.pdf"
              @change="handleIdUpload"
              class="w-full text-sm text-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
            />
            <p class="text-red-600 text-xs mt-1">{{ t('register.auction_buyer.id_hint') || 'Required for auction verification' }}</p>
          </div>

          <!-- Passwords -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-sm font-medium text-red-700 mb-1">{{ t('auth.password') }} *</label>
              <input
                v-model="form.password"
                type="password"
                id="password"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.password')"
                minlength="8"
              />
              <p class="text-red-600 text-xs mt-1">{{ t('register.password.min_length') }}</p>
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.password.confirm_label') }} *</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                id="confirmPassword"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.password')"
              />
            </div>
          </div>

          <!-- Terms and Privacy -->
          <div class="space-y-3">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="terms"
                  v-model="form.termsAccepted"
                  type="checkbox"
                  required
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="terms" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.agree_terms') }} <a href="/terms" class="text-red-800 hover:underline">{{ t('terms_of_service') }}</a> *
              </label>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="privacy"
                  v-model="form.privacyAccepted"
                  type="checkbox"
                  required
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="privacy" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.agree_privacy') }} <a href="/privacy" class="text-red-800 hover:underline">{{ t('privacy_policy') }}</a> *
              </label>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="marketing"
                  v-model="form.marketingAccepted"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="marketing" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.marketing_emails') }}
              </label>
            </div>
          </div>

          <!-- Important Notice -->
          <div class="bg-red-100 border border-red-300 rounded-lg p-4">
            <p class="text-red-700 text-sm">
              <strong>{{ t('register.important_notice.title') }}:</strong> {{ t('register.important_notice.message') }}
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-600 text-sm pt-2">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !form.termsAccepted || !form.privacyAccepted"
            class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50 mt-4"
          >
            <span v-if="loading">{{ t('register.creating_account') || 'Creating account...' }}</span>
            <span v-else>{{ t('auth.signup_button') }}</span>
          </button>
        </form>
      </div>

      <!-- Right Column (Visual) -->
      <div class="hidden md:flex flex-col justify-center items-center">
        <div class="bg-white/80 rounded-xl p-6 w-full h-full flex items-center justify-center border border-red-200">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 class="text-xl font-bold text-red-800 mb-2">{{ t('register.join_title') }}</h2>
            <p class="text-red-700 text-sm mb-4">
              {{ roleMessage }}
            </p>
            
            <div class="text-left text-sm text-red-600 space-y-2">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.verified_vehicles') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.export_support') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.secure_payment') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.multi_language') }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 text-center text-sm text-red-600">
          {{ t('auth.have_account') }} 
          <NuxtLink to="/login" class="text-red-800 hover:text-red-900 font-semibold">{{ t('auth.login_link') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Set SEO meta tags
useHead({
  title: t('register.seo.title') || 'Create Account - SwissExportCar',
  meta: [
    {
      name: 'description',
      content: t('register.seo.description') || 'Create your SwissExportCar account to buy or sell Swiss vehicles for export'
    }
  ]
})

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'direct_buyer' as 'direct_buyer' | 'auction_buyer' | 'seller',
  buyerType: 'direct' as 'direct' | 'auction',
  companyName: '',
  businessType: '' as 'private' | 'dealer' | 'business' | '',
  canton: '',
  city: '',
  zipCode: '',
  country: 'Switzerland',
  taxId: '',
  streetAddress: '',
  termsAccepted: false,
  privacyAccepted: false,
  marketingAccepted: false,
  idDocument: null as File | null,
})

const loading = ref(false)
const error = ref<string | null>(null)

const cantons = ['Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura']

const setRole = (role: 'direct_buyer' | 'auction_buyer' | 'seller') => {
  form.value.role = role
  if (role === 'direct_buyer') {
    form.value.buyerType = 'direct'
  } else if (role === 'auction_buyer') {
    form.value.buyerType = 'auction'
  }
  // seller keeps empty buyerType, but not used
}

const roleMessage = computed(() => {
  if (form.value.role === 'direct_buyer') {
    return t('register.direct_buyer_message') || 'Browse and purchase vehicles directly from Swiss sellers.'
  }
  if (form.value.role === 'auction_buyer') {
    return t('register.auction_buyer_message') || 'Bid on exclusive Swiss vehicle auctions and win your dream car.'
  }
  return t('register.seller_message')
})

const handleIdUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    form.value.idDocument = target.files[0]
  }
}

const validatePhoneNumber = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 9) {
    return t('register.validation.phone_too_short') || 'Phone number too short'
  }
  return null
}

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return t('register.validation.password_length') || 'Password must be at least 8 characters long'
  }
  return null
}

const formatPhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  if (value.startsWith('41')) {
    value = '+' + value
  } else if (!value.startsWith('+')) {
    value = '+41' + value
  }
  
  // Format: +41 79 123 45 67
  if (value.length > 3) {
    value = value.replace(/(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  
  form.value.phone = value
}

const handleRegister = async () => {
  // Validate passwords match
  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('register.validation.passwords_not_match') || 'Passwords do not match'
    return
  }

  // Validate password strength
  const passwordError = validatePassword(form.value.password)
  if (passwordError) {
    error.value = passwordError
    return
  }

  // Validate phone (only for non-direct_buyer)
  if (form.value.role !== 'direct_buyer') {
    const phoneError = validatePhoneNumber(form.value.phone)
    if (phoneError) {
      error.value = phoneError
      return
    }
  }

  // Validate terms
  if (!form.value.termsAccepted || !form.value.privacyAccepted) {
    error.value = t('register.validation.accept_terms') || 'Please accept the terms and privacy policy'
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const cleanedPhone = form.value.phone.replace(/\D/g, '')
    
    const { data, error: fetchError } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        phone: cleanedPhone,
        role: form.value.role,
        buyerType: form.value.buyerType,
        companyName: form.value.companyName,
        businessType: form.value.businessType,
        canton: form.value.role === 'seller' ? form.value.canton : undefined,
        city: form.value.city,
        zipCode: form.value.zipCode,
        country: form.value.role === 'seller' ? 'Switzerland' : form.value.country,
        taxId: form.value.taxId,
        streetAddress: form.value.role === 'seller' ? form.value.streetAddress : undefined,
        marketingAccepted: form.value.marketingAccepted,
      }
    })
    
    if (fetchError.value) {
      error.value = fetchError.value.message || t('register.messages.registration_failed') || 'Registration failed'
      return
    }
    
    // If auction buyer and ID file selected, upload separately (to be implemented)
    if (form.value.role === 'auction_buyer' && form.value.idDocument) {
      // TODO: implement ID document upload endpoint
    }
    
    alert(t('register.messages.success') || 'Account created successfully! Please login to continue.')
    await navigateTo('/login')
  } catch (err) {
    error.value = t('register.messages.registration_failed') || 'Registration failed. Please try again.'
    console.error('Registration error:', err)
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

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div>
    <!-- Button -->
    <button
      v-if="!isLoading"
      @click="showFeatureModal = true"
      :disabled="!canFeature"
      class="flex items-center px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center"
      :class="getButtonClasses()"
    >
      <svg v-if="isFeatured && isFeaturedActive" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span v-else-if="!canFeature" class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {{ t('feature.cant_feature') || "Can't Feature" }}
      </span>
      <span v-else class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        {{ t('feature.feature_car') || 'Feature Car' }}
        <!-- Free Credit Badge -->
        <span v-if="checkResult?.freeCreditsAvailable" class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
          {{ checkResult.freeCredits }} {{ t('feature.free') || 'FREE' }}
        </span>
      </span>
    </button>
    
    <!-- Loading -->
    <div v-else class="px-4 py-2">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
    </div>
    
    <!-- Feature Modal -->
    <div v-if="showFeatureModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-9999">
      <div class="bg-white rounded-xl p-6 max-w-md w-full relative z-10000">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ t('feature.modal_title') || 'Feature This Car' }}</h3>
          <button @click="showFeatureModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- Already Featured -->
          <div v-if="isFeatured && isFeaturedActive" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 class="font-semibold text-green-900">{{ t('feature.already_featured') || 'Already Featured!' }}</h4>
                <p class="text-green-700 text-sm mt-1">
                  <span v-if="permanentFeature">{{ t('feature.permanent_feature') || '🔥 Permanent Feature (until sold)' }}</span>
                  <span v-else>{{ t('feature.featured_until') || 'This car is featured until' }} {{ formatDate(featuredUntil) }}.
                  {{ featuredDaysRemaining > 0 ? `(${featuredDaysRemaining} ${t('feature.days_remaining') || 'days remaining'})` : '' }}</span>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Feature Options -->
          <div v-else>
            <!-- Free Credits Info -->
            <div v-if="checkResult?.freeCreditsAvailable" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <h4 class="font-semibold text-green-900">{{ t('feature.you_have_free_credits', { count: checkResult.freeCredits }) || `You have ${checkResult.freeCredits} free feature(s)!` }}</h4>
                    <p class="text-green-700 text-sm">
                      {{ t('feature.earned_from_listings', { earned: checkResult.earnedFreeFeatures, count: checkResult.listingCount, per: checkResult.listingsPerFreeFeature }) || `Earned: ${checkResult.earnedFreeFeatures} from ${checkResult.listingCount} listings (1 free per ${checkResult.listingsPerFreeFeature} listings)` }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-900">{{ checkResult.freeCredits }} {{ t('feature.free') || 'FREE' }}</div>
                  <div class="text-xs text-green-700">{{ t('feature.credits_available') || 'credits available' }}</div>
                </div>
              </div>
              
              <!-- Next free feature progress -->
              <div class="mt-3">
                <div class="flex justify-between text-xs text-green-800 mb-1">
                  <span>{{ t('feature.next_free_in_listings', { count: checkResult.listingsUntilNextFreeFeature }) || `Next free feature in ${checkResult.listingsUntilNextFreeFeature} more listings` }}</span>
                  <span>{{ checkResult.listingCount }}/{{ checkResult.nextFreeFeatureAt }}</span>
                </div>
                <div class="w-full bg-green-200 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min(100, (checkResult.listingCount / checkResult.nextFreeFeatureAt) * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Feature Options -->
            <div class="space-y-3">
              <!-- Option 1: Free Credit -->
              <div v-if="checkResult?.freeCreditsAvailable" 
                   class="border-2 border-green-500 rounded-lg p-4 hover:bg-green-50 cursor-pointer"
                   :class="{ 'bg-green-50': selectedOption === 'free' }"
                   @click="selectedOption = 'free'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-green-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ t('feature.use_free_credit') || 'Use Free Credit' }}</h4>
                      <p class="text-gray-600 text-sm">{{ t('feature.feature_for_days_free', { days: checkResult.durationDays }) || `Feature for ${checkResult.durationDays} days using 1 free credit` }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-green-600">{{ t('feature.free') || 'FREE' }}</div>
                    <div class="text-xs text-green-700">{{ t('feature.you_have_left', { count: checkResult.freeCredits }) || `You have ${checkResult.freeCredits} left` }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Option 2: Paid Temporary -->
              <div class="border-2 border-blue-500 rounded-lg p-4 hover:bg-blue-50 cursor-pointer"
                   :class="{ 'bg-blue-50 border-blue-600': selectedOption === 'paid' }"
                   @click="selectedOption = 'paid'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-blue-600 font-bold">{{ checkResult.durationDays }}</span>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ t('feature.temporary_feature') || 'Temporary Feature' }}</h4>
                      <p class="text-gray-600 text-sm">{{ t('feature.feature_for_days', { days: checkResult.durationDays }) || `Feature for ${checkResult.durationDays} days` }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-blue-600">{{ checkResult.price }} {{ t('currency.chf') }}</div>
                    <div class="text-xs text-blue-700">{{ t('feature.one_time_payment') || 'One-time payment' }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Option 3: Permanent Feature -->
              <div v-if="checkResult?.allowPermanentFeature"
                   class="border-2 border-red-500 rounded-lg p-4 hover:bg-red-50 cursor-pointer"
                   :class="{ 'bg-red-50 border-red-600': selectedOption === 'permanent' }"
                   @click="selectedOption = 'permanent'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-red-600 font-bold">∞</span>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ t('feature.permanent_feature_title') || 'Permanent Feature' }}</h4>
                      <p class="text-gray-600 text-sm">{{ t('feature.feature_until_sold') || 'Feature until car is sold or removed' }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-red-600">{{ checkResult.permanentFeaturePrice }} {{ t('currency.chf') }}</div>
                    <div class="text-xs text-red-700">{{ t('feature.one_time_payment') || 'One-time payment' }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Current Balance -->
            <div v-if="userData" class="bg-gray-50 rounded-lg p-4 mt-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700">{{ t('feature.your_balance') || 'Your Balance:' }}</span>
                <span class="font-bold">{{ userData.funds || 0 }} {{ t('currency.chf') }}</span>
              </div>
              
              <!-- Insufficient Funds Warning -->
              <div v-if="selectedOption === 'paid' && userData.funds < checkResult.price" class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span class="text-red-700 text-sm">
                    {{ t('feature.insufficient_funds_paid', { needed: checkResult.price - userData.funds }) || `Insufficient funds. You need ${checkResult.price - userData.funds} CHF more.` }}
                  </span>
                </div>
              </div>
              
              <div v-if="selectedOption === 'permanent' && userData.funds < checkResult.permanentFeaturePrice" class="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span class="text-red-700 text-sm">
                    {{ t('feature.insufficient_funds_permanent', { needed: checkResult.permanentFeaturePrice - userData.funds }) || `Insufficient funds. You need ${checkResult.permanentFeaturePrice - userData.funds} CHF more.` }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                @click="showFeatureModal = false"
                class="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                {{ t('feature.cancel') || 'Cancel' }}
              </button>
              <button
                @click="featureCar"
                :disabled="!selectedOption || isFeaturing || (selectedOption === 'paid' && userData.funds < checkResult.price) || (selectedOption === 'permanent' && userData.funds < checkResult.permanentFeaturePrice)"
                class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isFeaturing" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ t('feature.processing') || 'Processing...' }}
                </span>
                <span v-else>
                  {{ getActionButtonText() }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="fixed bottom-4 right-4 z-50">
      <div class="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold">{{ t('feature.success') || 'Success!' }}</p>
          <p class="text-sm opacity-90">{{ successMessage }}</p>
        </div>
        <button @click="showSuccessToast = false" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  carId: number
  isFeatured?: boolean
  featuredUntil?: string
  featuredDaysRemaining?: number
  permanentFeature?: boolean
}>()

const showFeatureModal = ref(false)
const showSuccessToast = ref(false)
const isLoading = ref(false)
const isFeaturing = ref(false)
const successMessage = ref('')
const userData = ref<any>(null)
const checkResult = ref<any>(null)
const selectedOption = ref<string>('')

// Computed properties
const isFeaturedActive = computed(() => {
  if (!props.isFeatured) return false
  if (props.permanentFeature) return true
  if (!props.featuredUntil) return false
  return new Date() < new Date(props.featuredUntil)
})

const canFeature = computed(() => {
  if (!checkResult.value) return false
  return checkResult.value.canFeature && !isFeaturedActive.value
})

// Methods
const getButtonClasses = () => {
  if (isFeaturedActive.value) {
    return props.permanentFeature 
      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  } else if (!canFeature.value) {
    return 'bg-gray-100 text-gray-400 cursor-not-allowed'
  } else {
    return 'bg-blue-600 text-white hover:bg-blue-700'
  }
}

const getActionButtonText = () => {
  switch (selectedOption.value) {
    case 'free':
      return t('feature.use_free_credit_days', { days: checkResult.value?.durationDays }) || `Use 1 Free Credit (${checkResult.value?.durationDays} days)`
    case 'paid':
      return t('feature.feature_for_amount', { amount: checkResult.value?.price }) || `Feature for ${checkResult.value?.price} CHF`
    case 'permanent':
      return t('feature.permanent_feature_amount', { amount: checkResult.value?.permanentFeaturePrice }) || `Permanent Feature for ${checkResult.value?.permanentFeaturePrice} CHF`
    default:
      return t('feature.select_option') || 'Select an option'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const loadUserData = async () => {
  try {
    const { data } = await useFetch('/api/auth/me', {
      credentials: 'include'
    })
    
    if (data.value?.user) {
      userData.value = data.value.user
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

const checkFeatureEligibility = async () => {
  try {
    isLoading.value = true
    const { data } = await useFetch(`/api/cars/${props.carId}/can-feature`, {
      credentials: 'include'
    })
    
    if (data.value) {
      checkResult.value = data.value
      // Auto-select free option if available
      if (data.value.freeCreditsAvailable) {
        selectedOption.value = 'free'
      } else {
        selectedOption.value = 'paid'
      }
    }
  } catch (error) {
    console.error('Error checking feature eligibility:', error)
  } finally {
    isLoading.value = false
  }
}

const featureCar = async () => {
  try {
    isFeaturing.value = true
    
    let body: any = {}
    
    if (selectedOption.value === 'free') {
      body = { useFreeCredit: true }
    } else if (selectedOption.value === 'paid') {
      body = { useFreeCredit: false, permanent: false }
    } else if (selectedOption.value === 'permanent') {
      body = { useFreeCredit: false, permanent: true }
    }
    
    const { data, error } = await useFetch(`/api/cars/${props.carId}/feature`, {
      method: 'POST',
      credentials: 'include',
      body
    })
    
    if (error.value) {
      throw new Error(error.value.data?.statusMessage || t('feature.failed_to_feature') || 'Failed to feature car')
    }
    
    if (data.value?.success) {
      if (selectedOption.value === 'free') {
        successMessage.value = t('feature.success_free', { days: data.value.durationDays, credits: data.value.remainingCredits }) || `Car featured for free! ${data.value.durationDays} days. You have ${data.value.remainingCredits} free credits left.`
      } else if (selectedOption.value === 'permanent') {
        successMessage.value = t('feature.success_permanent') || 'Car permanently featured! It will stay featured until sold or removed.'
      } else {
        successMessage.value = t('feature.success_paid', { days: data.value.durationDays }) || `Car featured for ${data.value.durationDays} days!`
      }
      
      showSuccessToast.value = true
      showFeatureModal.value = false
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  } catch (error: any) {
    alert(error.message || t('feature.failed_to_feature') || 'Failed to feature car. Please try again.')
  } finally {
    isFeaturing.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUserData(),
    checkFeatureEligibility()
  ])
})

// Watch for modal opening
watch(showFeatureModal, async (newVal) => {
  if (newVal) {
    await checkFeatureEligibility()
  } else {
    selectedOption.value = ''
  }
})
</script>
<style scoped>
/* Ensure modal appears above all content */
.modal-overlay {
  z-index: 9999 !important;
}

.modal-content {
  z-index: 10000 !important;
}

/* Also add this to ensure no overflow issues */
.relative.z-10 {
  position: relative;
  z-index: 10;
}
</style>
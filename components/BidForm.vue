<template>
  <div class="border border-slate-700 rounded-lg p-4">
    <h3 class="text-lg font-bold text-white mb-3">{{ t('auction.place_bid') }}</h3>
    <div v-if="auth.user">
      <div class="flex items-center justify-between mb-3">
        <span class="text-gray-400">{{ t('auction.current_bid') }}:</span>
        <span class="font-bold text-white">{{ currentBid }} {{ t('currency.chf') }}</span>
      </div>
      <div class="flex items-center justify-between mb-4">
        <span class="text-gray-400">{{ t('auction.your_max_bid') || 'Your max bid' }}:</span>
        <span class="font-bold text-white">{{ maxBid }} {{ t('currency.chf') }}</span>
      </div>

      <div class="mb-4">
        <label class="block text-gray-400 mb-2">{{ t('auction.your_bid') }} ({{ t('currency.chf') }})</label>
        <input 
          v-model="bidAmount" 
          type="number" 
          :min="minBid" 
          :max="auth.user.funds"
          class="w-full bg-slate-700 rounded-lg px-4 py-2 text-white mb-2"
          @input="validateBid"
        >
        <p class="text-sm text-gray-400">
          {{ t('auction.minimum_bid') || 'Minimum bid' }}: {{ minBid }} {{ t('currency.chf') }} ({{ t('auction.bid_increment_message') || 'increments of 50 CHF' }})
        </p>
      </div>

      <div v-if="bidError" class="text-red-400 text-sm mb-4">
        {{ bidError }}
      </div>

      <div class="flex items-center space-x-3">
        <button 
          @click="placeBid"
          :disabled="!canBid || loading"
          class="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium disabled:opacity-50"
        >
          <span v-if="loading">{{ t('auction.processing') || 'Processing...' }}</span>
          <span v-else>{{ t('auction.place_bid') }}</span>
        </button>
        <button 
          @click="setMaxBid"
          class="px-3 py-2 bg-slate-700 rounded-lg text-sm"
        >
          {{ t('auction.max_button') || 'Max' }}
        </button>
      </div>

      <div class="mt-4 text-sm text-gray-400">
        <p>{{ t('auction.agree_to_purchase') }}</p>
        <p v-if="auth.user.role === 'buyer' && !auth.user.verifiedBuyer" class="text-yellow-400 mt-1">
          {{ t('auction.verification_required') }}
        </p>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-gray-400 mb-3">{{ t('auction.login_to_bid_message') || 'You need to login to place bids' }}</p>
      <NuxtLink 
        :to="localePath('/login')" 
        class="inline-block px-4 py-2 bg-blue-600 rounded-lg"
      >
        {{ t('auth.login_link') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps({
  carId: {
    type: Number,
    required: true
  },
  currentBid: {
    type: Number,
    required: true
  },
  minBid: {
    type: Number,
    default: 50
  }
})

const auth = useAuth()
const bidAmount = ref(props.currentBid + props.minBid)
const maxBid = ref(auth.value.user?.funds || 0)
const bidError = ref('')
const loading = ref(false)

const canBid = computed(() => {
  return !bidError.value && 
         bidAmount.value >= props.currentBid + props.minBid &&
         bidAmount.value <= maxBid.value
})

const validateBid = () => {
  if (bidAmount.value < props.currentBid + props.minBid) {
    bidError.value = t('auction.bid_too_low', { amount: props.currentBid + props.minBid }) || `Bid must be at least ${props.currentBid + props.minBid} ${t('currency.chf')}`
  } else if (bidAmount.value > maxBid.value) {
    bidError.value = t('auction.insufficient_funds') || 'Bid exceeds your available funds'
  } else if (bidAmount.value % 50 !== 0) {
    bidError.value = t('auction.bid_increment_error') || 'Bid must be in increments of 50 CHF'
  } else {
    bidError.value = ''
  }
}

const setMaxBid = () => {
  bidAmount.value = maxBid.value
  validateBid()
}

const placeBid = async () => {
  if (!canBid.value) return
  
  loading.value = true
  try {
    const { data, error } = await useFetch('/api/bids/create', {
      method: 'POST',
      body: {
        carId: props.carId,
        amount: bidAmount.value
      }
    })

    if (error.value) {
      throw error.value
    }

    if (data.value?.success) {
      // Update UI or emit event
      emit('bid-placed', data.value.bid)
    }
  } catch (err: any) {
    console.error('Bid error:', err)
    bidError.value = err.message || t('auction.bid_failed') || 'Failed to place bid'
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['bid-placed'])
</script>
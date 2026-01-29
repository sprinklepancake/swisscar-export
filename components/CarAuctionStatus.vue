<template>
  <div class="border border-slate-700 rounded-lg p-4 mb-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-bold text-white">{{ t('auction.status') }}</h3>
      <span class="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
        {{ timeLeft }}
      </span>
    </div>

    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-400">{{ t('auction.starting_price') }}:</span>
        <span class="font-medium text-white">{{ car.startingPrice }} {{ t('currency.chf') }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">{{ t('auction.current_bid') }}:</span>
        <span class="font-medium text-white">{{ highestBid || t('auction.no_bids_yet') || 'No bids yet' }} {{ highestBid ? t('currency.chf') : '' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">{{ t('auction.bid_increment') }}:</span>
        <span class="font-medium text-white">50 {{ t('currency.chf') }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">{{ t('auction.bids_count') }}:</span>
        <span class="font-medium text-white">{{ bids.length }}</span>
      </div>
    </div>

    <BidForm 
      v-if="car.status === 'auction'"
      :car-id="car.id"
      :current-bid="highestBid"
      :min-bid="50"
      @bid-placed="handleNewBid"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps({
  car: {
    type: Object,
    required: true
  },
  bids: {
    type: Array,
    default: () => []
  }
})

const highestBid = computed(() => {
  return props.bids.reduce((max, bid) => Math.max(max, bid.amount), props.car.startingPrice)
})

const timeLeft = computed(() => {
  const end = new Date(props.car.auctionEnd)
  const now = new Date()
  const diff = end - now
  
  if (diff <= 0) return t('auction.auction_ended') || 'Auction ended'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}h ${minutes}m ${t('auction.time_left') || 'left'}`
})

const handleNewBid = (bid) => {
  emit('new-bid', bid)
}

const emit = defineEmits(['new-bid'])
</script>
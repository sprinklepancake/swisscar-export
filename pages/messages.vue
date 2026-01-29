<!-- pages/messages.vue - INTERNATIONALIZED VERSION -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold text-red-800 mb-4">{{ t('messages.title') }}</h1>
        <p class="text-xl text-red-700 max-w-2xl mx-auto">
          {{ t('messages.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Chat List -->
        <div class="lg:col-span-1">
          <div class="glass rounded-2xl border border-red-200 shadow-xl overflow-hidden">
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="chats.length === 0" class="text-center py-16">
              <div class="max-w-md mx-auto">
                <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-red-900 mb-2">{{ t('messages.empty_state.title') }}</h3>
                <p class="text-red-600 mb-6">
                  {{ t('messages.empty_state.message') }}
                </p>
                <NuxtLink 
                  to="/cars" 
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  {{ t('browse_cars') }}
                </NuxtLink>
              </div>
            </div>

            <!-- Chats List -->
            <div v-else class="divide-y divide-red-200 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div
                v-for="chat in chats"
                :key="chat.id"
                @click="openChat(chat)"
                class="p-4 hover:bg-red-50 cursor-pointer transition-colors duration-200 group"
                :class="{ 'bg-red-100': activeChatId === chat.id }"
              >
                <div class="flex items-start space-x-3">
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {{ getInitials(chat.otherUserName) }}
                    </div>
                  </div>

                  <!-- Chat Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between mb-1">
                      <h3 class="text-base font-semibold text-red-900 truncate">
                        {{ chat.otherUserName || t('messages.default_user') }}
                      </h3>
                      <span class="text-xs text-red-500 flex-shrink-0 ml-2">
                        {{ formatTime(chat.lastMessage?.createdAt) }}
                      </span>
                    </div>
                    
                    <!-- Car Info -->
                    <div class="mb-2">
                      <p class="text-sm text-red-700 font-medium truncate">
                        {{ chat.carInfo || t('messages.default_car_info') }}
                      </p>
                      <div class="flex items-center text-xs text-red-600 mt-1">
                        <span class="bg-red-100 px-2 py-0.5 rounded mr-2" v-if="chat.carYear">
                          {{ chat.carYear }}
                        </span>
                        <span class="bg-red-100 px-2 py-0.5 rounded" v-if="chat.carPrice">
                          {{ formatNumber(chat.carPrice) }} {{ t('currency.chf') }}
                        </span>
                      </div>
                    </div>

                    <!-- Last Message -->
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-red-800 truncate max-w-[180px]" :class="{
                        'font-semibold text-red-900': chat.unreadCount > 0
                      }">
                        {{ getMessagePreview(chat.lastMessage) }}
                      </p>
                      
                      <!-- Unread Badge -->
                      <div v-if="chat.unreadCount > 0" class="flex-shrink-0">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium bg-red-500 text-white">
                          {{ chat.unreadCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Chat Messages -->
        <div class="lg:col-span-2">
          <div v-if="activeChatId" class="glass rounded-2xl border border-red-200 shadow-xl h-full flex flex-col">
            <!-- Chat Header -->
            <div class="p-4 border-b border-red-200 bg-red-50/50 flex items-center justify-between rounded-t-2xl">
              <div class="flex items-center">
                <button 
                  @click="closeChat" 
                  class="mr-3 text-red-600 hover:text-red-800 lg:hidden"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {{ getInitials(activeChatInfo?.otherUserName) }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-red-900">{{ activeChatInfo?.otherUserName || t('messages.default_chat') }}</h3>
                    <p class="text-sm text-red-700">{{ activeChatInfo?.carInfo || t('messages.default_car_details') }}</p>
                  </div>
                </div>
              </div>
              <button 
                @click="closeChat" 
                class="text-red-600 hover:text-red-800 hidden lg:block"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Car Info Card -->
            <div v-if="activeChatInfo?.car" class="p-4 border-b border-red-200 bg-white">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-red-200">
                  <img 
                    :src="activeChatInfo.car.images?.[0] || '/placeholder-car.jpg'" 
                    :alt="activeChatInfo.carInfo"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-red-900">{{ activeChatInfo.carInfo }}</h4>
                  <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div class="text-red-700">
                      <span class="font-medium">{{ t('car_details.year') }}:</span> {{ activeChatInfo.car.year }}
                    </div>
                    <div class="text-red-700">
                      <span class="font-medium">{{ t('car_details.price') }}:</span> {{ formatNumber(activeChatInfo.car.price) }} {{ t('currency.chf') }}
                    </div>
                    <div class="text-red-700">
                      <span class="font-medium">{{ t('car_details.location') || 'Location' }}:</span> {{ activeChatInfo.car.city }}, {{ activeChatInfo.car.canton }}
                    </div>
                    <div class="text-red-700">
                      <span class="font-medium">{{ t('messages.status') }}:</span> 
                      <span :class="getStatusClass(activeChatInfo.car.status)" class="ml-1 px-2 py-0.5 rounded-full text-xs">
                        {{ getStatusDisplay(activeChatInfo.car.status, activeChatInfo.car.listingType) }}
                      </span>
                    </div>
                  </div>
                </div>
                <NuxtLink 
                  :to="`/cars/${activeChatInfo.car.id}`"
                  class="text-red-600 hover:text-red-800 flex-shrink-0 flex items-center"
                >
                  <span class="text-sm mr-1">{{ t('messages.view') }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </NuxtLink>
              </div>
            </div>
            
            <!-- Chat Messages Area -->
            <div class="flex-1 overflow-hidden">
              <ChatSystem 
                :is-open="true"
                :chat-id="activeChatId"
                @close="closeChat"
                @update:is-open="handleChatClose"
              />
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="glass rounded-2xl border border-red-200 shadow-xl h-full flex items-center justify-center p-8">
            <div class="text-center">
              <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-red-900 mb-2">{{ t('messages.select_conversation.title') }}</h3>
              <p class="text-red-600 mb-4">
                {{ t('messages.select_conversation.message') }}
              </p>
              <p class="text-red-500 text-sm max-w-md">
                {{ t('messages.select_conversation.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuth()

// Set SEO meta tags
useHead({
  title: t('messages.seo.title') || 'Your Messages - SwissExportCar',
  meta: [
    {
      name: 'description',
      content: t('messages.seo.description') || 'Manage your conversations with sellers and buyers on SwissExportCar'
    }
  ]
})

const loading = ref(true)
const chats = ref<any[]>([])
const activeChatId = ref<number | null>(null)
const activeChatInfo = ref<any>(null)

const getInitials = (name: string) => {
  if (!name) return t('messages.initials.default') || 'U'
  return name.split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2)
}

const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffHours < 48) {
    return t('messages.time.yesterday') || 'Yesterday'
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
}

const formatNumber = (num: any) => {
  if (!num && num !== 0) return '0'
  const numberValue = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(numberValue)) return '0'
  return numberValue.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

const getMessagePreview = (message: any) => {
  if (!message?.content) return t('messages.preview.no_messages') || 'No messages yet'
  const content = message.content
  return content.length > 30 ? content.substring(0, 30) + '...' : content
}

const openChat = (chat: any) => {
  activeChatId.value = chat.id
  activeChatInfo.value = chat
  
  console.log('Opening chat:', {
    id: chat.id,
    otherUserName: chat.otherUserName,
    buyerId: chat.buyerId,
    sellerId: chat.sellerId,
    currentUserId: auth.user.value?.id
  })
  
  // Update URL for direct link sharing
  router.push({ query: { chat: chat.id } })
  
  // Mark messages as read
  if (chat.unreadCount > 0) {
    markMessagesAsRead(chat.id)
  }
}

const closeChat = () => {
  activeChatId.value = null
  activeChatInfo.value = null
  router.push({ query: {} })
}

const handleChatClose = (isOpen: boolean) => {
  if (!isOpen) {
    closeChat()
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'auction': return 'bg-yellow-100 text-yellow-800'
    case 'sold': return 'bg-red-100 text-red-800'
    case 'auction_ended': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

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

const loadChats = async () => {
  loading.value = true
  try {
    const response: any = await $fetch('/api/chat')
    console.log('Chats response:', response)
    
    // Process chats to ensure we have all needed data
    chats.value = (response.chats || []).map((chat: any) => ({
      ...chat,
      otherUserName: chat.otherUserName || t('messages.default_user') || 'User',
      carInfo: chat.carInfo || `${chat.car?.make || ''} ${chat.car?.model || ''}`.trim() || t('messages.default_car_info') || 'Car',
      carYear: chat.car?.year || '',
      carPrice: chat.car?.price || 0,
      car: chat.car || null,
      unreadCount: chat.unreadCount || 0
    }))
    
    console.log('Processed chats:', chats.value)
  } catch(err) {
    console.error('Error loading chats:', err)
  } finally {
    loading.value = false
  }
}

const markMessagesAsRead = async (chatId: number) => {
  try {
    await $fetch(`/api/chat/${chatId}/read`, {
      method: 'POST'
    })
    
    // Update local chat unread count
    const chatIndex = chats.value.findIndex(c => c.id === chatId)
    if (chatIndex !== -1) {
      chats.value[chatIndex].unreadCount = 0
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

onMounted(async () => {
  await loadChats()

  if (route.query.chat) {
    const chatId = parseInt(route.query.chat as string)
    const chat = chats.value.find(c => c.id === chatId)
    if (chat) {
      openChat(chat)
    }
  }
})

// Watch for route changes to handle direct chat links
watch(() => route.query.chat, (newChatId) => {
  if (newChatId) {
    const chatId = parseInt(newChatId as string)
    const chat = chats.value.find(c => c.id === chatId)
    if (chat) {
      openChat(chat)
    }
  } else {
    activeChatId.value = null
    activeChatInfo.value = null
  }
})

// Refresh chats periodically
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(() => {
  refreshInterval.value = setInterval(async () => {
    await loadChats()
  }, 30000) // Refresh every 30 seconds
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.glass {
  @apply bg-white/70 backdrop-blur-md;
}

/* Custom scrollbar for chat list */
.max-h-\[calc\(100vh-250px\)\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[calc\(100vh-250px\)\]::-webkit-scrollbar-track {
  @apply bg-red-50 rounded-full;
}

.max-h-\[calc\(100vh-250px\)\]::-webkit-scrollbar-thumb {
  @apply bg-red-300 rounded-full;
}

.max-h-\[calc\(100vh-250px\)\]::-webkit-scrollbar-thumb:hover {
  @apply bg-red-400;
}
</style>
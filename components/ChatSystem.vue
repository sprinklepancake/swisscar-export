<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeChat">
    <div class="glass rounded-2xl max-w-4xl w-full h-[700px] border border-red-200 shadow-2xl flex flex-col">
      <!-- Chat Header with Car Info -->
      <div class="p-4 border-b border-red-200 bg-red-50/50 rounded-t-2xl">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-red-900">
                  {{ t('chat.chat_with') || 'Chat with' }} {{ otherUserName || t('messages.default_user') || 'User' }}
                </h3>
                <p class="text-sm text-red-700">
                  {{ chatData?.isCurrentUserSeller ? t('chat.you_are_seller') || 'You are the seller' : t('chat.you_are_buyer') || 'You are the buyer' }}
                </p>
              </div>
              <button @click="closeChat" class="text-red-700 hover:text-red-900 transition-colors ml-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Car Information -->
            <div v-if="carInfo" class="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <div class="flex items-center">
                <div class="w-12 h-12 flex-shrink-0 mr-3 rounded-lg overflow-hidden border border-red-200">
                  <img 
                    :src="carInfo.images?.[0] || '/placeholder-car.jpg'" 
                    :alt="carInfo.make + ' ' + carInfo.model"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-red-900">
                    {{ carInfo.make }} {{ carInfo.model }} ({{ carInfo.year }})
                  </h4>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {{ formatNumber(carInfo.price) }} {{ t('currency.chf') }}
                    </span>
                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {{ carInfo.mileage?.toLocaleString() }} km
                    </span>
                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {{ carInfo.city }}, {{ carInfo.canton }}
                    </span>
                    <NuxtLink 
                      :to="`/cars/${carInfo.id}`"
                      class="text-xs text-red-600 hover:text-red-800 underline ml-2"
                      @click.stop
                    >
                      {{ t('car_details.view_listing') || 'View Listing' }} →
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p class="text-red-700">{{ t('chat.loading_conversation') || 'Loading conversation...' }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadChatData" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            {{ t('chat.try_again') || 'Try Again' }}
          </button>
        </div>
      </div>

      <!-- Chat Content -->
      <template v-else>
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Empty State -->
          <div v-if="messages.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <p class="text-red-600 mb-2">{{ t('chat.no_messages_yet') || 'No messages yet. Start the conversation!' }}</p>
            <p class="text-red-500 text-sm">{{ t('chat.discuss_car_details') || 'Discuss details about the' }} {{ carInfo?.make }} {{ carInfo?.model }}</p>
          </div>

          <!-- Messages -->
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="flex"
            :class="{ 'justify-end': isMyMessage(message.senderId) }"
          >
            <div 
              class="max-w-[70%] rounded-2xl px-4 py-3 shadow-sm"
              :class="isMyMessage(message.senderId) 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                : 'bg-white border border-red-200 text-red-900'"
            >
              <!-- Sender Info with Avatar -->
              <div class="flex items-center mb-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white text-xs mr-2">
                  {{ getInitials(message.senderName) }}
                </div>
                <p class="text-sm font-medium" :class="isMyMessage(message.senderId) ? 'text-red-100' : 'text-red-700'">
                  {{ message.senderName || (isMyMessage(message.senderId) ? t('chat.you') || 'You' : t('messages.default_user') || 'User') }}
                </p>
              </div>
              
              <!-- Message Content -->
              <p class="break-words mb-2">{{ message.content }}</p>
              
              <!-- Time and Status -->
              <div class="flex justify-between items-center">
                <p class="text-xs" :class="isMyMessage(message.senderId) ? 'text-red-200' : 'text-red-500'">
                  {{ formatTime(message.createdAt) }}
                </p>
                <div v-if="isMyMessage(message.senderId)" class="flex items-center">
                  <span v-if="message.read" class="text-xs text-green-300 ml-2 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    {{ t('chat.read') || 'Read' }}
                  </span>
                  <span v-else class="text-xs text-red-200 ml-2">
                    {{ t('chat.sent') || 'Sent' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-red-200 bg-white rounded-b-2xl">
          <form @submit.prevent="sendMessage" class="flex space-x-3">
            <input 
              v-model="newMessage"
              type="text"
              :placeholder="t('chat.type_message_placeholder') || 'Type your message...'"
              class="flex-1 p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              :disabled="sending"
              @keyup.enter="sendMessage"
            >
            <button 
              type="submit"
              :disabled="!newMessage.trim() || sending"
              class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="!sending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span class="ml-2 hidden sm:inline">{{ t('chat.send_button') || 'Send' }}</span>
            </button>
          </form>
          <p class="text-xs text-red-500 mt-2 text-center">
            {{ t('chat.discussion_topics') || 'Discuss price, viewing arrangements, export documents, and transport details' }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  chatId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:isOpen', 'close'])

const auth = useAuth()
const messagesContainer = ref<HTMLElement | null>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const error = ref('')
const chatData = ref<any>(null)
const carInfo = ref<any>(null)

const otherUserName = computed(() => {
  if (!chatData.value) return t('messages.default_user') || 'User'
  return chatData.value.isCurrentUserSeller 
    ? chatData.value.buyer?.name || t('chat.buyer') || 'Buyer'
    : chatData.value.seller?.name || t('chat.seller') || 'Seller'
})

const getInitials = (name: string) => {
  if (!name) return t('messages.initials.default') || 'U'
  return name.split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2)
}

const formatNumber = (num: any) => {
  if (!num && num !== 0) return '0'
  const numberValue = typeof num === 'string' ? parseFloat(num) : num
  return numberValue.toLocaleString('de-CH')
}

const currentUserData = computed(() => {
  console.log('🔍 Current user data in ChatSystem:', auth.user.value)
  return auth.user.value
})

const isMyMessage = (senderId: number) => {
  const currentUserId = auth.user.value?.id
  console.log('🔍 Checking if message is mine:', {
    senderId,
    currentUserId,
    authUser: auth.user.value
  })
  return senderId === currentUserId
}

const formatTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffHours < 48) {
    return (t('messages.time.yesterday') || 'Yesterday') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
}

const loadChatData = async () => {
  if (!props.chatId) {
    error.value = t('chat.no_chat_id') || 'No chat ID provided'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('📥 Loading chat data for ID:', props.chatId)
    console.log('👤 Current auth user:', auth.user.value)
    
    const response = await $fetch(`/api/chat/${props.chatId}`)
    
    console.log('✅ Chat API response:', {
      chat: response.chat,
      messagesCount: response.messages?.length,
      firstMessage: response.messages?.[0]
    })
    
    chatData.value = response.chat
    messages.value = response.messages || []
    
    // Check each message
    messages.value.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, {
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        isMe: isMyMessage(msg.senderId)
      })
    })
    
    // Then, get car information separately if not included
    if (chatData.value.carId && !chatData.value.car) {
      try {
        const carResponse = await $fetch(`/api/cars/${chatData.value.carId}`)
        carInfo.value = carResponse
        console.log('✅ Car info loaded:', carInfo.value)
      } catch (carErr) {
        console.error('Failed to load car info:', carErr)
      }
    } else if (chatData.value.car) {
      carInfo.value = chatData.value.car
    }
    
    // Scroll to bottom
    await nextTick()
    scrollToBottom()
    
  } catch (err: any) {
    console.error('❌ Failed to load chat:', err)
    error.value = err.data?.message || t('chat.load_failed') || 'Failed to load chat'
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return

  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  
  // Optimistically add message to UI
  const tempMessage = {
    id: Date.now(),
    content: messageContent,
    senderId: auth.user.value?.id,
    senderName: auth.user.value?.name || t('chat.you') || 'You',
    createdAt: new Date().toISOString(),
    read: false
  }
  
  messages.value.push(tempMessage)
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
  
  sending.value = true

  try {
    console.log('📤 Sending message:', messageContent)
    console.log('📤 To chat ID:', props.chatId)
    
    const response = await $fetch(`/api/chat/${props.chatId}/send`, {
      method: 'POST',
      body: {
        content: messageContent
      }
    })

    console.log('✅ Message sent:', response)

    if (response.success && response.message) {
      // Replace temp message with real message
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...response.message,
          senderName: auth.user.value?.name || t('chat.you') || 'You'
        }
      } else {
        // Add the message if temp wasn't found
        messages.value.push({
          ...response.message,
          senderName: auth.user.value?.name || t('chat.you') || 'You'
        })
      }
      
      // Scroll to bottom again
      await nextTick()
      scrollToBottom()
    }

  } catch (err: any) {
    console.error('❌ Failed to send message:', err)
    
    // Remove temp message on error
    const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
    if (messageIndex !== -1) {
      messages.value.splice(messageIndex, 1)
    }
    
    // Restore message to input
    newMessage.value = messageContent
    
    alert(t('chat.send_failed') || 'Failed to send message. Please try again.')
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const closeChat = () => {
  console.log('Closing chat modal')
  emit('update:isOpen', false)
  emit('close')
}

// Load chat data when component mounts or chatId changes
watch(() => props.chatId, (newId) => {
  if (newId && props.isOpen) {
    loadChatData()
  }
}, { immediate: true })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.chatId) {
    loadChatData()
  }
})
</script>

<style scoped>
.glass {
  @apply bg-white/95 backdrop-blur-md;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-red-50 rounded-full;
}

::-webkit-scrollbar-thumb {
  @apply bg-red-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-red-400;
}
</style>
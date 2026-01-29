<template>
  <div class="transaction-history">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title || t('transactions.title') || 'Transaction History' }}</h3>
      <div class="flex items-center space-x-2">
        <select
          v-model="filterType"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="all">{{ t('transactions.all_types') || 'All Types' }}</option>
          <option value="deposit">{{ t('profile.transactions.type.deposit') || 'Deposits' }}</option>
          <option value="withdrawal">{{ t('profile.transactions.type.withdrawal') || 'Withdrawals' }}</option>
          <option value="payment">{{ t('profile.transactions.type.payment') || 'Payments' }}</option>
          <option value="refund">{{ t('profile.transactions.type.refund') || 'Refunds' }}</option>
        </select>
        
        <button
          @click="refresh"
          class="p-1 text-gray-500 hover:text-gray-700"
          :disabled="loading"
        >
          <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mx-auto"></div>
      <p class="text-gray-600 text-sm mt-2">{{ t('transactions.loading') || 'Loading transactions...' }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center py-8 border border-gray-200 rounded-lg">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
      <p class="text-gray-500">{{ t('transactions.no_transactions') || 'No transactions found' }}</p>
      <p v-if="filterType !== 'all'" class="text-gray-400 text-sm mt-1">
        {{ t('transactions.try_changing_filter') || 'Try changing the filter' }}
      </p>
    </div>
    
    <!-- Transactions list -->
    <div v-else class="space-y-3">
      <div
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center mb-1">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full mr-2"
                :class="getTypeClass(transaction.type)"
              >
                {{ getTypeLabel(transaction.type) }}
              </span>
              <span class="text-sm text-gray-500">
                {{ formatDate(transaction.createdAt) }}
              </span>
            </div>
            
            <p class="font-medium text-gray-900 mb-1">
              {{ transaction.description }}
            </p>
            
            <div class="text-sm text-gray-600 space-y-1">
              <p v-if="transaction.referenceId" class="flex items-center">
                <span class="text-gray-400 mr-1">{{ t('transactions.ref') || 'Ref:' }}</span>
                <code class="bg-gray-100 px-1 py-0.5 rounded text-xs">{{ transaction.referenceId }}</code>
              </p>
              <p class="flex items-center">
                <span class="text-gray-400 mr-1">{{ t('transactions.balance') || 'Balance:' }}</span>
                <span class="font-medium">{{ transaction.previousBalance }} {{ t('currency.chf') }}</span>
                <svg class="w-4 h-4 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="font-bold">{{ transaction.newBalance }} {{ t('currency.chf') }}</span>
              </p>
            </div>
          </div>
          
          <div class="text-right ml-4">
            <p
              class="text-lg font-bold"
              :class="getAmountClass(transaction.type)"
            >
              {{ getAmountPrefix(transaction.type) }}{{ transaction.amount }} {{ t('currency.chf') }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ transaction.type === 'payment' ? t('transactions.debit') || 'Debit' : t('transactions.credit') || 'Credit' }}
            </p>
          </div>
        </div>
        
        <!-- Metadata (expandable) -->
        <div v-if="transaction.metadata && Object.keys(transaction.metadata).length > 0">
          <button
            @click="toggleMetadata(transaction.id)"
            class="text-xs text-gray-500 hover:text-gray-700 mt-2 flex items-center"
          >
            <span>{{ t('transactions.details') || 'Details' }}</span>
            <svg
              class="w-3 h-3 ml-1 transition-transform"
              :class="{ 'rotate-180': expandedTransactions.includes(transaction.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <div
            v-if="expandedTransactions.includes(transaction.id)"
            class="mt-2 pt-2 border-t border-gray-100"
          >
            <div class="bg-gray-50 rounded p-3">
              <h4 class="text-xs font-medium text-gray-700 mb-2">{{ t('transactions.transaction_details') || 'Transaction Details:' }}</h4>
              <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ JSON.stringify(transaction.metadata, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Load more button -->
    <div v-if="filteredTransactions.length > 0 && !hideLoadMore" class="text-center mt-6">
      <button
        @click="loadMore"
        :disabled="loadingMore || !hasMore"
        class="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{
          loadingMore 
            ? t('transactions.loading_more') || 'Loading...'
            : hasMore 
              ? t('transactions.load_more') || 'Load More Transactions'
              : t('transactions.no_more') || 'No More Transactions'
        }}
      </button>
    </div>
    
    <!-- Summary -->
    <div v-if="showSummary && filteredTransactions.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <p class="text-sm text-green-700">{{ t('transactions.total_deposits') || 'Total Deposits' }}</p>
          <p class="text-xl font-bold text-green-900">{{ calculateTotal('deposit') }} {{ t('currency.chf') }}</p>
        </div>
        <div class="text-center p-3 bg-red-50 rounded-lg">
          <p class="text-sm text-red-700">{{ t('transactions.total_payments') || 'Total Payments' }}</p>
          <p class="text-xl font-bold text-red-900">{{ calculateTotal('payment') }} {{ t('currency.chf') }}</p>
        </div>
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-700">{{ t('transactions.total_refunds') || 'Total Refunds' }}</p>
          <p class="text-xl font-bold text-blue-900">{{ calculateTotal('refund') }} {{ t('currency.chf') }}</p>
        </div>
        <div class="text-center p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-700">{{ t('transactions.total_withdrawals') || 'Total Withdrawals' }}</p>
          <p class="text-xl font-bold text-gray-900">{{ calculateTotal('withdrawal') }} {{ t('currency.chf') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Transaction {
  id: number
  userId: number
  type: 'deposit' | 'withdrawal' | 'refund' | 'payment'
  amount: number
  previousBalance: number
  newBalance: number
  description: string
  referenceId?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

interface Props {
  userId?: number
  title?: string
  limit?: number
  showSummary?: boolean
  hideLoadMore?: boolean
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  showSummary: true,
  hideLoadMore: false,
  autoLoad: true
})

const loading = ref(false)
const loadingMore = ref(false)
const transactions = ref<Transaction[]>([])
const filterType = ref('all')
const expandedTransactions = ref<number[]>([])
const currentPage = ref(1)
const hasMore = ref(true)

const filteredTransactions = computed(() => {
  if (filterType.value === 'all') {
    return transactions.value
  }
  return transactions.value.filter(t => t.type === filterType.value)
})

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Type helpers
const getTypeClass = (type: string) => {
  switch (type) {
    case 'deposit': return 'bg-green-100 text-green-800'
    case 'refund': return 'bg-blue-100 text-blue-800'
    case 'payment': return 'bg-red-100 text-red-800'
    case 'withdrawal': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'deposit': return t('profile.transactions.type.deposit') || 'Deposit'
    case 'refund': return t('profile.transactions.type.refund') || 'Refund'
    case 'payment': return t('profile.transactions.type.payment') || 'Payment'
    case 'withdrawal': return t('profile.transactions.type.withdrawal') || 'Withdrawal'
    default: return type
  }
}

const getAmountClass = (type: string) => {
  return type === 'deposit' || type === 'refund'
    ? 'text-green-600'
    : 'text-red-600'
}

const getAmountPrefix = (type: string) => {
  return type === 'deposit' || type === 'refund'
    ? '+'
    : '-'
}

// Load transactions
const loadTransactions = async (page = 1, append = false) => {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  
  try {
    const endpoint = props.userId 
      ? `/api/admin/users/${props.userId}/transactions?page=${page}&limit=${props.limit}`
      : `/api/user/transactions?page=${page}&limit=${props.limit}`
    
    const { data } = await useFetch(endpoint)
    
    if (data.value?.success) {
      const newTransactions = data.value.transactions || []
      
      if (append) {
        transactions.value = [...transactions.value, ...newTransactions]
      } else {
        transactions.value = newTransactions
      }
      
      hasMore.value = newTransactions.length === props.limit
      currentPage.value = page
    }
  } catch (err) {
    console.error('Failed to load transactions:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const refresh = () => {
  loadTransactions(1, false)
}

const loadMore = () => {
  loadTransactions(currentPage.value + 1, true)
}

const toggleMetadata = (transactionId: number) => {
  const index = expandedTransactions.value.indexOf(transactionId)
  if (index > -1) {
    expandedTransactions.value.splice(index, 1)
  } else {
    expandedTransactions.value.push(transactionId)
  }
}

const calculateTotal = (type: string) => {
  return filteredTransactions.value
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    .toFixed(2)
}

// Auto load on mount if enabled
onMounted(() => {
  if (props.autoLoad) {
    loadTransactions()
  }
})

// Watch for filter changes
watch(filterType, () => {
  // Optional: You could implement filtering on the server side
  // For now, we filter client-side
})
</script>

<style scoped>
.transaction-history {
  @apply w-full;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
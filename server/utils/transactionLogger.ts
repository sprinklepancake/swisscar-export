// server/utils/transactionLogger.ts
interface TransactionData {
  userId: number
  type: 'deposit' | 'withdrawal' | 'listing_fee' | 'refund'
  amount: number
  description: string
  adminId?: number
  carId?: number
}

export async function logTransaction(data: TransactionData) {
  // In a real app, save to a transactions table
  // For now, log to console or file
  console.log('📝 Transaction:', {
    ...data,
    timestamp: new Date().toISOString()
  })
  
  // TODO: Save to database
  // await Transaction.create(data)
}
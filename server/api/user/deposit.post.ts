// server/api/user/deposit.post.ts
import jwt from 'jsonwebtoken'
import { TransactionService } from '~/server/services/transactionService'
import { getUserById, updateUser } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in to deposit funds'
      })
    }
    
    const config = useRuntimeConfig()
    
    if (!config.jwtAccessSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      })
    }
    
    let decodedToken: any = null
    
    try {
      decodedToken = jwt.verify(accessToken, config.jwtAccessSecret)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token. Please log in again.'
      })
    }
    
    const userId = decodedToken.userId
    
    const body = await readBody(event)
    const { amount, paymentMethod = 'manual', reference = '' } = body
    
    if (!amount || isNaN(parseFloat(amount))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid amount is required'
      })
    }
    
    const depositAmount = parseFloat(amount)
    
    if (depositAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be greater than 0'
      })
    }
    
    if (depositAmount > 10000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum deposit amount is 10,000 CHF'
      })
    }
    
    // Get user
    const user = await getUserById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Log transaction
    const transaction = await TransactionService.logTransaction({
      userId,
      type: 'deposit',
      amount: depositAmount,
      description: `Deposit via ${paymentMethod}${reference ? ` (${reference})` : ''}`,
      referenceId: `DEPOSIT-${Date.now()}-${userId}`,
      metadata: {
        paymentMethod,
        reference,
        adminApproved: false
      }
    })
    
    // Update user funds
    await updateUser(userId, { funds: transaction.newBalance })
    
    console.log('✅ Deposit successful:', {
      userId,
      amount: depositAmount,
      newBalance: transaction.newBalance,
      transactionId: transaction.transaction.id
    })
    
    return {
      success: true,
      message: 'Deposit successful',
      transaction: {
        id: transaction.transaction.id,
        type: transaction.transaction.type,
        amount: transaction.transaction.amount,
        newBalance: transaction.newBalance,
        createdAt: transaction.transaction.createdAt
      },
      user: {
        id: userId,
        newBalance: transaction.newBalance
      }
    }
    
  } catch (error: any) {
    console.error('❌ Deposit error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to process deposit'
    })
  }
})
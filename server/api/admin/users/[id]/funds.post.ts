// server/api/admin/users/[id]/funds.post.ts - FIXED VERSION
import { getUserById } from '~/server/database/repositories/userRepository'
import { TransactionLog } from '~/server/database/models/TransactionLog'

export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'id') || '0')
    const { amount, description = 'Admin adjustment' } = await readBody(event)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }
    
    if (!amount || isNaN(parseFloat(amount))) {
      throw createError({
        statusCode: 400,
        message: 'Valid amount is required'
      })
    }
    
    const targetBalance = parseFloat(amount)
    
    // Get user
    const user = await getUserById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    // Get current admin info from context
    const currentAdmin = event.context.user
    const adminId = currentAdmin?.id
    const adminName = currentAdmin?.name
    
    // Get current balance
    const currentBalance = parseFloat((user as any).funds) || 0
    
    // Calculate difference (the change amount)
    const difference = targetBalance - currentBalance
    
    // If no change, return early
    if (difference === 0) {
      return {
        success: true,
        message: 'No change in balance',
        newBalance: currentBalance
      }
    }
    
    // Determine transaction type based on the difference
    let transactionType = 'admin_adjustment'
    if (difference > 0) {
      transactionType = 'deposit'
    } else {
      transactionType = 'withdrawal'
    }
    
    // Calculate new balance
    const newBalance = currentBalance + difference
    
    // Log transaction - IMPORTANT: Store the CHANGE amount, not the new balance
    const transaction = await TransactionLog.create({
      userId,
      type: transactionType,
      amount: difference, // Store the change amount (e.g., 240), NOT the new balance (1200)
      previousBalance: currentBalance,
      newBalance,
      description: description || `Admin ${transactionType} by ${adminName || 'Admin'}`,
      referenceId: `ADMIN-${Date.now()}-${userId}`,
      metadata: {
        adminId,
        adminName,
        reason: description,
        adjustmentType: 'manual',
        previousBalance: currentBalance,
        targetBalance,
        difference,
        operation: transactionType
      },
      adminId,
      status: 'completed'
    })
    
    console.log('✅ Admin funds transaction logged:', {
      userId,
      adminId,
      transactionType,
      changeAmount: difference, // e.g., 240
      previousBalance: currentBalance, // e.g., 960
      newBalance, // e.g., 1200
      transactionId: transaction.id
    })
    
    // Update user funds
    const { updateUser } = await import('~/server/database/repositories/userRepository')
    await updateUser(userId, { funds: newBalance })
    
    return {
      success: true,
      message: 'Funds updated successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount, // This is 240
        previousBalance: transaction.previousBalance, // This is 960
        newBalance: transaction.newBalance, // This is 1200
        createdAt: transaction.createdAt
      },
      newBalance,
      adjustment: {
        amount: Math.abs(difference), // This is 240
        type: transactionType,
        admin: {
          id: adminId,
          name: adminName
        }
      }
    }
  } catch (error: any) {
    console.error('Error updating funds:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update funds'
    })
  }
})
// server/api/admin/users/[id]/unverify.post.ts
import { getUserById, updateUser } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }
    
    const user = await getUserById(userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    // Unverify ALL users
    await updateUser(userId, { verified: false })
    
    return {
      success: true,
      message: 'User unverified successfully'
    }
  } catch (error) {
    console.error('Error unverifying user:', error)
    return {
      success: false,
      error: 'Failed to unverify user'
    }
  }
})
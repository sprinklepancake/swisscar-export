// server/api/admin/users/[id]/ban.post.ts
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
    
    await updateUser(userId, { banned: true })
    
    return {
      success: true,
      message: 'User banned successfully'
    }
  } catch (error) {
    console.error('Error banning user:', error)
    return {
      success: false,
      error: 'Failed to ban user'
    }
  }
})
// server/api/user/request-verification.post.ts
import { User } from '../../database/models/User'
import { ActivityLog } from '../../database/models/ActivityLog'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.auth?.userId

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if already verified
    if (user.verifiedBuyer) {
      return {
        success: true,
        message: 'User already verified',
        alreadyVerified: true
      }
    }

    // Log verification request
    await ActivityLog.create({
      userId,
      type: 'profile_update',
      action: 'Verification Requested',
      description: 'User requested buyer verification',
      metadata: {
        requestedAt: new Date().toISOString()
      },
      ipAddress: event.node.req.socket.remoteAddress,
      userAgent: event.node.req.headers['user-agent']
    })

    // TODO: Send notification to admin (you can implement this later)
    // await notifyAdminAboutVerificationRequest(user)

    return {
      success: true,
      message: 'Verification request sent to admin. You will be notified once reviewed.'
    }
  } catch (error) {
    console.error('Error requesting verification:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to request verification'
    })
  }
})
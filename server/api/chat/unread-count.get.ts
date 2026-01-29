// server/api/chat/unread-count.get.ts
import { Message, Chat } from '~/server/database/models'
import { Op } from 'sequelize'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  const unreadCount = await Message.count({
    include: [{
      model: Chat,
      as: 'chat', // ADD THIS - matches your association alias
      where: {
        [Op.or]: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      }
    }],
    where: {
      senderId: { [Op.ne]: user.id },
      read: false
    }
  })
  
  return { count: unreadCount }
})
import { Chat, Message, User, Car } from '../models'
import { Op } from 'sequelize'

export const getOrCreateChat = async (buyerId: number, sellerId: number, carId: number) => {
  let chat = await Chat.findOne({
    where: { buyerId, sellerId, carId },
    include: [
      { model: User, as: 'buyer' },
      { model: User, as: 'seller' },
      { model: Car }
    ]
  })

  if (!chat) {
    chat = await Chat.create({
      buyerId,
      sellerId,
      carId
    })
    
    // Reload with associations
    chat = await Chat.findByPk(chat.id, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Car }
      ]
    })
  }

  return chat
}

export const getChatMessages = async (chatId: number) => {
  return await Message.findAll({
    where: { chatId },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'name', 'email'] }
    ],
    order: [['createdAt', 'ASC']]
  })
}

export const sendMessage = async (chatId: number, senderId: number, content: string) => {
  const message = await Message.create({
    chatId,
    senderId,
    content
  })

  // Update chat's last message timestamp
  await Chat.update(
    { lastMessageAt: new Date() },
    { where: { id: chatId } }
  )

  return await Message.findByPk(message.id, {
    include: [
      { model: User, as: 'sender', attributes: ['id', 'name', 'email'] }
    ]
  })
}



export const getUserChats = async (userId: number) => {
  return await Chat.findAll({
    where: {
      [Op.or]: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    },
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
      { model: Car, attributes: ['id', 'make', 'model', 'year', 'price'] },
      {
        model: Message,
        separate: true,
        limit: 1,
        order: [['createdAt', 'DESC']]
      }
    ],
    order: [['lastMessageAt', 'DESC']]
  })
}

export const markMessagesAsRead = async (chatId: number, userId: number) => {
  await Message.update(
    { read: true },
    {
      where: {
        chatId,
        senderId: { [Op.ne]: userId },
        read: false
      }
    }
  )
}
// server/database/repositories/bidRepository.ts - FIXED VERSION
import { Bid } from '../models/Bid'

export async function createBid(bidData: {
  carId: number
  userId: number
  amount: number
  status?: 'pending' | 'won' | 'lost' | 'cancelled'
}) {
  try {
    const bid = await Bid.create({
      carId: bidData.carId,
      userId: bidData.userId,
      amount: bidData.amount,
      status: bidData.status || 'pending'
    })
    return bid
  } catch (error) {
    console.error('Error creating bid:', error)
    throw error
  }
}

export async function getBidsByCarId(carId: number) {
  try {
    const bids = await Bid.findAll({
      where: { carId },
      order: [['amount', 'DESC']],  // Changed from 'createdAt' to 'amount' for proper sorting
      raw: false  // Get plain objects instead of Sequelize instances
    })
    
    // Convert Decimal to number and ensure proper format
    return bids.map(bid => ({
      ...bid,
      amount: parseFloat(bid.amount) || 0,
      id: Number(bid.id),
      carId: Number(bid.carId),
      userId: Number(bid.userId)
    }))
  } catch (error) {
    console.error('Error fetching bids by carId:', error)
    throw error
  }
}

export async function getBidsByUserId(userId: number) {
  try {
    const bids = await Bid.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      raw: true
    })
    
    return bids.map(bid => ({
      ...bid,
      amount: parseFloat(bid.amount) || 0
    }))
  } catch (error) {
    console.error('Error fetching bids by userId:', error)
    throw error
  }
}

export async function getBidById(id: number) {
  try {
    const bid = await Bid.findByPk(id, { raw: true })
    if (bid) {
      return {
        ...bid,
        amount: parseFloat(bid.amount) || 0
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching bid by id:', error)
    throw error
  }
}

export async function updateBidStatus(id: number, status: 'pending' | 'won' | 'lost' | 'cancelled') {
  try {
    const bid = await Bid.findByPk(id)
    if (!bid) {
      throw new Error('Bid not found')
    }
    
    bid.status = status
    await bid.save()
    return bid
  } catch (error) {
    console.error('Error updating bid status:', error)
    throw error
  }
}
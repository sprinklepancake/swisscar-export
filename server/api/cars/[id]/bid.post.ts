// server/api/cars/[id]/bid.post.ts
// Same behaviour as /api/bids/create — see server/utils/bidding.ts.
import { placeBid } from '~/server/utils/bidding'

export default defineEventHandler(async (event) => {
  const carId = getRouterParam(event, 'id')
  const { amount } = (await readBody(event)) || {}
  return await placeBid(event, carId, amount)
})

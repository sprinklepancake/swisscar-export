// server/api/bids/create.post.ts
// Thin wrapper — all the logic lives in server/utils/bidding.ts so that this
// route and /api/cars/[id]/bid can never drift apart again.
import { placeBid } from '~/server/utils/bidding'

export default defineEventHandler(async (event) => {
  const { carId, amount } = (await readBody(event)) || {}
  return await placeBid(event, carId, amount)
})

import { User } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sellerName, sellerEmail, sellerPhone } = body

  console.log('🔍 Searching for seller:', { sellerName, sellerEmail, sellerPhone })

  let seller = null

  // Try to find by email first (most reliable)
  if (sellerEmail) {
    seller = await User.findOne({
      where: { email: sellerEmail }
    })
    if (seller) {
      console.log('✅ Found seller by email:', seller.id)
      return { seller: { id: seller.id, name: seller.name, email: seller.email } }
    }
  }

  // Try to find by phone
  if (sellerPhone && !seller) {
    seller = await User.findOne({
      where: { phone: sellerPhone }
    })
    if (seller) {
      console.log('✅ Found seller by phone:', seller.id)
      return { seller: { id: seller.id, name: seller.name, email: seller.email } }
    }
  }

  // Try to find by name (least reliable)
  if (sellerName && !seller) {
    seller = await User.findOne({
      where: { name: sellerName }
    })
    if (seller) {
      console.log('✅ Found seller by name:', seller.id)
      return { seller: { id: seller.id, name: seller.name, email: seller.email } }
    }
  }

  console.log('❌ No seller found with the provided contact info')
  return { seller: null }
})
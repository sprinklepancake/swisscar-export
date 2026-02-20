// server/api/user/find-seller.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { sellerName, sellerEmail, sellerPhone } = await readBody(event)
  const supabase = getSupabaseAdmin()

  if (sellerEmail) {
    const { data } = await supabase.from('users').select('id, name, email').eq('email', sellerEmail).single()
    if (data) return { seller: { id: data.id, name: data.name, email: data.email } }
  }
  if (sellerPhone) {
    const { data } = await supabase.from('users').select('id, name, email').eq('phone', sellerPhone).single()
    if (data) return { seller: { id: data.id, name: data.name, email: data.email } }
  }
  if (sellerName) {
    const { data } = await supabase.from('users').select('id, name, email').eq('name', sellerName).single()
    if (data) return { seller: { id: data.id, name: data.name, email: data.email } }
  }

  return { seller: null }
})

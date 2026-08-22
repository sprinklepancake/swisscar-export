// server/api/user/find-seller.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'

// SECURITY: unauthenticated account enumeration — anyone could look up a user by name, phone or email.
// Nothing in the UI calls this; it is an admin/debug tool, so lock it down.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

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

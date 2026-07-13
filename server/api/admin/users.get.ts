// server/api/admin/users.get.ts
// Returns all users for the admin panel. ID documents now live in the PRIVATE
// 'user-documents' bucket; we generate a short-lived signed URL per user so the
// admin can view them, instead of exposing a permanent public URL.
import { getSupabaseAdmin } from '~/server/utils/supabase'

const PRIVATE_BUCKET = 'user-documents'
const SIGNED_URL_TTL = 60 * 60 // 1 hour

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, phone, role, verified, banned, funds, company_name, business_type, canton, city, zip_code, country, profile_image, created_at, updated_at, free_feature_credits, id_document_url, buyer_type')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = await Promise.all((users || []).map(async (u: any) => {
      let idDocumentUrl: string | null = null
      const stored = u.id_document_url
      if (stored) {
        if (typeof stored === 'string' && stored.startsWith('http')) {
          // Legacy public URL from before the fix — still works, but you should
          // migrate these files into the private bucket and re-store the path.
          idDocumentUrl = stored
        } else {
          // New private path -> generate a temporary signed URL for the admin.
          const { data: signed } = await supabase.storage
            .from(PRIVATE_BUCKET)
            .createSignedUrl(stored, SIGNED_URL_TTL)
          idDocumentUrl = signed?.signedUrl || null
        }
      }

      return {
        id: u.id, email: u.email, name: u.name, phone: u.phone || '',
        role: u.role, verified: u.verified || false, banned: u.banned || false,
        funds: parseFloat(u.funds || 0), companyName: u.company_name || '',
        businessType: u.business_type || '', canton: u.canton || '',
        city: u.city || '', zipCode: u.zip_code || '', country: u.country || '',
        profileImage: u.profile_image || '', freeFeatureCredits: u.free_feature_credits || 0,
        createdAt: u.created_at, updatedAt: u.updated_at,
        idDocumentUrl,
        buyerType: u.buyer_type || 'direct',
      }
    }))

    return { success: true, users: mapped }
  } catch (error: any) {
    return { success: false, error: 'Failed to fetch users' }
  }
})
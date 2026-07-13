// server/api/auth/register.post.ts
// SECURITY FIX: ID documents uploaded at registration now go to the PRIVATE
// 'user-documents' bucket and we store only the storage PATH (not a public URL).
import { getSupabaseAdmin } from '~/server/utils/supabase'

const PRIVATE_BUCKET = 'user-documents'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, phone, role, companyName, businessType, canton, city, zipCode, country, taxId, streetAddress, buyerType, idDocumentUrl, idFileBase64, idFileMimeType } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and password are required' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const supabase = getSupabaseAdmin()
  let authUserId: string | null = null

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate')) {
        throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
      }
      throw createError({ statusCode: 400, statusMessage: authError.message })
    }

    if (!authData.user) throw createError({ statusCode: 500, statusMessage: 'Failed to create auth user' })
    authUserId = authData.user.id

    // Upload ID document to the PRIVATE bucket; store the PATH only.
    let resolvedIdDocumentPath: string | null = idDocumentUrl || null
    if (idFileBase64 && idFileMimeType) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (allowedTypes.includes(idFileMimeType)) {
        try {
          const ext = idFileMimeType.split('/')[1].replace('jpeg', 'jpg')
          const fileName = `id-${authUserId}-${Date.now()}.${ext}`
          const filePath = `id-documents/${fileName}`
          const fileBuffer = Buffer.from(idFileBase64, 'base64')
          const { error: uploadError } = await supabase.storage
            .from(PRIVATE_BUCKET)
            .upload(filePath, fileBuffer, { contentType: idFileMimeType, upsert: false })
          if (!uploadError) {
            resolvedIdDocumentPath = filePath
          } else {
            console.warn('[register] ID upload failed (non-blocking):', uploadError.message)
          }
        } catch (uploadErr) {
          console.warn('[register] ID upload exception (non-blocking):', uploadErr)
        }
      }
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('auth_uid', authUserId)
      .maybeSingle()

    const isSeller = (role || 'buyer') === 'seller'
    const profileFields = {
      name,
      phone: phone || null,
      role: role || 'buyer',
      buyer_type: buyerType || 'direct',
      id_document_url: resolvedIdDocumentPath,
      company_name: isSeller ? (companyName || null) : null,
      business_type: isSeller ? (businessType || null) : null,
      canton: canton || null,
      city: city || null,
      zip_code: zipCode || null,
      country: country || 'Switzerland',
      tax_id: isSeller ? (taxId || null) : null,
      street_address: streetAddress || null,
    }

    if (existing) {
      await supabase.from('users').update(profileFields).eq('id', existing.id)
      return { success: true, userId: existing.id }
    }

    const { data: profile, error: profileError } = await supabase.from('users').insert({
      auth_uid: authUserId,
      email,
      ...profileFields,
      funds: 0,
      verified: false,
      banned: false,
    }).select('id').single()

    if (profileError) {
      console.error('[register] Profile insert error:', profileError)
      await supabase.auth.admin.deleteUser(authUserId)
      throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
    }

    return { success: true, userId: profile.id }
  } catch (error: any) {
    console.error('[register] Unhandled error:', error?.message || error)
    if (authUserId && !error.statusCode) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {})
    }
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Registration failed' })
  }
})
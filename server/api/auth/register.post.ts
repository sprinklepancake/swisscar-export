// server/api/auth/register.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

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
    console.log('[register] Creating auth user for:', email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('[register] Auth error:', authError)
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate')) {
        throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
      }
      throw createError({ statusCode: 400, statusMessage: authError.message })
    }

    if (!authData.user) throw createError({ statusCode: 500, statusMessage: 'Failed to create auth user' })
    authUserId = authData.user.id
    console.log('[register] Auth user created:', authUserId)

    // Upload ID document server-side using admin client (user is not yet authenticated client-side)
    let resolvedIdDocumentUrl: string | null = idDocumentUrl || null
    if (idFileBase64 && idFileMimeType) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (allowedTypes.includes(idFileMimeType)) {
        try {
          const ext = idFileMimeType.split('/')[1].replace('jpeg', 'jpg')
          const fileName = `id-${authUserId}-${Date.now()}.${ext}`
          const filePath = `id-documents/${fileName}`
          const fileBuffer = Buffer.from(idFileBase64, 'base64')
          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, fileBuffer, { contentType: idFileMimeType, upsert: false })
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(filePath)
            resolvedIdDocumentUrl = publicUrl
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

    if (existing) {
      console.log('[register] Profile already exists (trigger), updating:', existing.id)
      const isSeller = (role || 'buyer') === 'seller'
      await supabase.from('users').update({
        name,
        phone: phone || null,
        role: role || 'buyer',
        buyer_type: buyerType || 'direct',
        id_document_url: resolvedIdDocumentUrl,
        company_name: isSeller ? (companyName || null) : null,
        business_type: isSeller ? (businessType || null) : null,
        canton: canton || null,
        city: city || null,
        zip_code: zipCode || null,
        country: country || 'Switzerland',
        tax_id: isSeller ? (taxId || null) : null,
        street_address: streetAddress || null,
      }).eq('id', existing.id)

      return { success: true, userId: existing.id }
    }

    const isSeller = (role || 'buyer') === 'seller'
    console.log('[register] Inserting profile row, isSeller:', isSeller, 'buyerType:', buyerType)

    const { data: profile, error: profileError } = await supabase.from('users').insert({
      auth_uid: authUserId,
      email,
      name,
      phone: phone || null,
      role: role || 'buyer',
      buyer_type: buyerType || 'direct',
      id_document_url: resolvedIdDocumentUrl,
      company_name: isSeller ? (companyName || null) : null,
      business_type: isSeller ? (businessType || null) : null,
      canton: canton || null,
      city: city || null,
      zip_code: zipCode || null,
      country: country || 'Switzerland',
      tax_id: isSeller ? (taxId || null) : null,
      street_address: streetAddress || null,
      funds: 0,
      verified: false,
      banned: false,
    }).select('id').single()

    if (profileError) {
      console.error('[register] Profile insert error:', profileError)
      await supabase.auth.admin.deleteUser(authUserId)
      throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
    }

    console.log('[register] Profile created:', profile.id)
    return { success: true, userId: profile.id }

  } catch (error: any) {
    console.error('[register] Unhandled error:', error)
    if (authUserId && !error.statusCode) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {})
    }
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Registration failed' })
  }
})
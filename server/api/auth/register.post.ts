// server/api/auth/register.post.ts
//
// Registration is the single gate into the platform, and it enforces two rules:
//
//   1. EVERY new account must supply an identity document. It is uploaded with
//      the service-role key into the PRIVATE 'user-documents' bucket and only
//      the storage PATH is stored — admins view it through a short-lived signed
//      URL from /api/admin/users.
//   2. EVERY new account starts unverified. Until an administrator opens the
//      admin panel, looks at that document and presses Verify, the account can
//      browse the site and nothing else. It cannot post, message or bid.
import { getSupabaseAdmin } from '~/server/utils/supabase'

const PRIVATE_BUCKET = 'user-documents'
const ALLOWED_ID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_ID_BYTES = 6 * 1024 * 1024 // 6 MB of decoded bytes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    name, email, password, phone, role, companyName, businessType,
    canton, city, zipCode, country, taxId, streetAddress, buyerType,
    idFileBase64, idFileMimeType,
  } = body || {}

  // ── Basic validation ──────────────────────────────────────────────────────
  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and password are required' })
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address' })
  }
  if (String(password).length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }
  const requestedRole = role === 'seller' ? 'seller' : 'buyer'
  if (requestedRole === 'seller' && !phone) {
    throw createError({ statusCode: 400, statusMessage: 'A phone number is required for seller accounts' })
  }

  // ── The ID document is mandatory for everyone ─────────────────────────────
  if (!idFileBase64 || !idFileMimeType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'An identity document is required. Please upload a photo of your passport or ID card so an administrator can verify your account.',
    })
  }
  if (!ALLOWED_ID_TYPES.includes(idFileMimeType)) {
    throw createError({ statusCode: 400, statusMessage: 'The identity document must be a JPG, PNG or PDF file.' })
  }

  let idBuffer: Buffer
  try {
    idBuffer = Buffer.from(idFileBase64, 'base64')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'The identity document could not be read. Please try uploading it again.' })
  }
  if (!idBuffer.length) {
    throw createError({ statusCode: 400, statusMessage: 'The identity document appears to be empty. Please try uploading it again.' })
  }
  if (idBuffer.length > MAX_ID_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `That document is ${(idBuffer.length / (1024 * 1024)).toFixed(1)} MB. Please upload a file smaller than 6 MB.`,
    })
  }

  const supabase = getSupabaseAdmin()
  const normalisedEmail = String(email).trim().toLowerCase()
  let authUserId: string | null = null
  let uploadedPath: string | null = null

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalisedEmail,
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

    // ── Store the document. BLOCKING: an account with no document cannot be
    //    verified, so silently continuing (as this used to do) just creates
    //    accounts that are stuck in limbo with no way for the admin to help.
    const ext = idFileMimeType.split('/')[1].replace('jpeg', 'jpg').replace('pdf', 'pdf')
    const filePath = `id-documents/id-${authUserId}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(PRIVATE_BUCKET)
      .upload(filePath, idBuffer, { contentType: idFileMimeType, upsert: false })

    if (uploadError) {
      console.error('[register] ID upload failed:', uploadError.message)
      throw createError({
        statusCode: 502,
        statusMessage: 'We could not store your identity document. Please try again in a moment.',
      })
    }
    uploadedPath = filePath

    const isSeller = requestedRole === 'seller'
    const profileFields = {
      name,
      phone: phone ? String(phone).replace(/\D/g, '') : null,
      role: requestedRole,
      buyer_type: isSeller ? 'direct' : (buyerType === 'auction' ? 'auction' : 'direct'),
      id_document_url: filePath,
      company_name: isSeller ? (companyName || null) : null,
      business_type: isSeller ? (businessType || null) : null,
      canton: canton || null,
      city: city || null,
      zip_code: zipCode || null,
      country: country || 'Switzerland',
      tax_id: isSeller ? (taxId || null) : null,
      street_address: streetAddress || null,
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('auth_uid', authUserId)
      .maybeSingle()

    if (existing) {
      await supabase.from('users').update(profileFields).eq('id', existing.id)
      return { success: true, userId: existing.id, verified: false }
    }

    const { data: profile, error: profileError } = await supabase.from('users').insert({
      auth_uid: authUserId,
      email: normalisedEmail,
      ...profileFields,
      funds: 0,
      verified: false, // an administrator has to approve every account
      banned: false,
    }).select('id').single()

    if (profileError) {
      console.error('[register] Profile insert error:', profileError)
      throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
    }

    return {
      success: true,
      userId: profile.id,
      verified: false,
      message: 'Account created. An administrator will review your ID document before you can post, message or bid.',
    }
  } catch (error: any) {
    // Roll everything back so a half-created account never blocks a retry.
    if (uploadedPath) {
      await supabase.storage.from(PRIVATE_BUCKET).remove([uploadedPath]).catch(() => {})
    }
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {})
    }
    console.error('[register] Unhandled error:', error?.message || error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Registration failed' })
  }
})

// server/api/auth/register.post.ts
//
// TRUST MODEL (changed — this used to gate the whole site behind an ID check):
//
//   1. An identity document is required ONLY from accounts that ask for auction
//      access. Sellers and ordinary ("direct") buyers never upload one. The ID
//      exists to make the "bid and don't pay → banned" rule enforceable, and
//      that rule only applies to bidders, so demanding a passport from every
//      visitor who wants to list a Golf was pure friction.
//   2. An ordinary account is usable the moment it is created. It can log in,
//      post listings and message people with no admin step in between.
//   3. Auction access is the one thing an administrator still approves by hand:
//      the account is created immediately and works normally, but bidding stays
//      locked until an admin has looked at the ID and pressed "Approve for
//      auctions" (users.verified_buyer).
//
// Phone numbers are optional and international — see server/utils/phone.ts.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { normalisePhone, isPlausiblePhone } from '~/server/utils/phone'
import { notifyAdminInBackground } from '~/server/utils/notify'

const PRIVATE_BUCKET = 'user-documents'
const ALLOWED_ID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_ID_BYTES = 6 * 1024 * 1024 // 6 MB of decoded bytes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    name, email, password, phone, role, companyName, businessType,
    canton, city, zipCode, country, taxId, streetAddress, buyerType,
    idFileBase64, idFileMimeType, marketingAccepted,
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
  const isSeller = requestedRole === 'seller'
  // Only a buyer picks between "buy directly" and "take part in auctions".
  // A seller runs auctions, they do not bid in them.
  const wantsAuction = !isSeller && buyerType === 'auction'

  // A seller's number is published on their listings, so it is the one place a
  // phone is still mandatory. Any country's format is accepted.
  const normalisedPhone = normalisePhone(phone)
  if (isSeller && !normalisedPhone) {
    throw createError({ statusCode: 400, statusMessage: 'A phone number is required for seller accounts' })
  }
  if (normalisedPhone && !isPlausiblePhone(normalisedPhone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'That phone number does not look right. Please include your country code, for example +41 79 123 45 67 or +40 721 234 567.',
    })
  }

  // ── The ID document: auction accounts only ────────────────────────────────
  // A direct buyer or a seller MAY still attach one (it does no harm and saves
  // a step if they later ask for auction access), but it is never demanded.
  const hasIdUpload = !!(idFileBase64 && idFileMimeType)

  if (wantsAuction && !hasIdUpload) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Auction accounts need an identity document. Please upload a photo of your passport or ID card, or choose "Buy cars directly" to sign up without one.',
    })
  }

  let idBuffer: Buffer | null = null
  if (hasIdUpload) {
    if (!ALLOWED_ID_TYPES.includes(idFileMimeType)) {
      throw createError({ statusCode: 400, statusMessage: 'The identity document must be a JPG, PNG or PDF file.' })
    }
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

    // ── Store the document, if there is one. BLOCKING when the account asked
    //    for auction access: without the file an admin has nothing to approve,
    //    so silently continuing would strand the account.
    if (idBuffer) {
      const ext = idFileMimeType.split('/')[1].replace('jpeg', 'jpg')
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
    }

    const profileFields = {
      name,
      phone: normalisedPhone,
      role: requestedRole,
      buyer_type: isSeller ? 'direct' : (wantsAuction ? 'auction' : 'direct'),
      id_document_url: uploadedPath,
      company_name: isSeller ? (companyName || null) : null,
      business_type: isSeller ? (businessType || null) : null,
      // Only meaningful for a Swiss address. The form clears it when the
      // country changes, but a direct API call need not.
      canton: (country || 'Switzerland') === 'Switzerland' ? (canton || null) : null,
      city: city || null,
      zip_code: zipCode || null,
      country: country || 'Switzerland',
      tax_id: isSeller ? (taxId || null) : null,
      street_address: streetAddress || null,
      // The form has always asked for this consent and the server has always
      // discarded it, so an opt-in was never recorded anywhere — the opposite of
      // what a consent checkbox is for.
      notification_preferences: { marketing: marketingAccepted === true },
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('auth_uid', authUserId)
      .maybeSingle()

    let userId: number

    if (existing) {
      await supabase.from('users').update(profileFields).eq('id', existing.id)
      userId = existing.id as number
    } else {
      const { data: profile, error: profileError } = await supabase.from('users').insert({
        auth_uid: authUserId,
        email: normalisedEmail,
        ...profileFields,
        funds: 0,
        // The account works straight away. `verified` stays as an administrator
        // lever (it can be revoked to restrict a problem account) rather than a
        // gate every new signup has to wait behind.
        verified: true,
        // Bidding is the one capability an admin still grants by hand.
        verified_buyer: false,
        banned: false,
      }).select('id').single()

      if (profileError) {
        console.error('[register] Profile insert error:', profileError)
        throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
      }
      userId = profile.id as number
    }

    // ── Tell the administrators. Backgrounded so a slow mail provider cannot
    //    make a successful signup look like a failure.
    const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
    notifyAdminInBackground({
      type: 'user_registered',
      userId,
      subject: wantsAuction
        ? `New AUCTION account awaiting approval: ${name}`
        : `New ${requestedRole} account: ${name}`,
      body: [
        `A new account has been created on swisscarexport.ch.`,
        ``,
        `Name:     ${name}`,
        `Email:    ${normalisedEmail}`,
        `Phone:    ${normalisedPhone || '—'}`,
        `Role:     ${requestedRole}${wantsAuction ? ' (auction buyer)' : ''}`,
        `Country:  ${profileFields.country || '—'}`,
        `City:     ${profileFields.city || '—'}`,
        ...(isSeller ? [`Company:  ${companyName || '—'}`] : []),
        ``,
        wantsAuction
          ? `This account uploaded an ID and is WAITING for auction approval. It can already browse, message and list, but cannot bid until you approve it.`
          : `No action needed — the account is active. Direct buyers and sellers do not require ID verification.`,
        ``,
        `Admin panel: ${siteUrl}/en/admin`,
      ].join('\n'),
      metadata: {
        role: requestedRole,
        buyerType: profileFields.buyer_type,
        wantsAuction,
        email: normalisedEmail,
        hasIdDocument: !!uploadedPath,
      },
    })

    return {
      success: true,
      userId,
      verified: true,
      auctionApproved: false,
      pendingAuctionApproval: wantsAuction,
      message: wantsAuction
        ? 'Account created. You can log in and use the site straight away — bidding unlocks once an administrator has checked your ID document.'
        : 'Account created. You can log in and start using the site straight away.',
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

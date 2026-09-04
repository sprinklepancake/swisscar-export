// server/api/user/upload-id.post.ts
// SECURITY FIX: ID documents now go to the PRIVATE 'user-documents' bucket and
// we store only the storage PATH (not a public URL). Admins fetch a short-lived
// signed URL when they need to view a document.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { notifyAdminInBackground } from '~/server/utils/notify'

const PRIVATE_BUCKET = 'user-documents'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file provided' })
    }

    const fileField = formData.find(f => f.name === 'file')
    if (!fileField || !fileField.data) {
      throw createError({ statusCode: 400, statusMessage: 'File field missing' })
    }

    const mimeType = fileField.type || 'application/octet-stream'
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(mimeType)) {
      throw createError({ statusCode: 400, statusMessage: 'Only JPG, PNG, or PDF files are allowed' })
    }
    if (fileField.data.length > 5 * 1024 * 1024) {
      throw createError({ statusCode: 400, statusMessage: 'File too large. Maximum 5MB.' })
    }

    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `id-${user.id}-${Date.now()}.${ext}`
    const filePath = `id-documents/${fileName}` // path INSIDE the private bucket

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.storage
      .from(PRIVATE_BUCKET)
      .upload(filePath, fileField.data, { contentType: mimeType, upsert: false })

    if (error) {
      console.error('[upload-id] storage error:', error.message)
      throw createError({ statusCode: 500, statusMessage: `Upload failed: ${error.message}` })
    }

    // Store the PATH, not a public URL. buyer_type is set in the SAME statement:
    // an identity document is only ever uploaded to get auction access, and the
    // admin queue keys off both columns. Setting them together is what stops an
    // upload from landing in a state no queue matches — which is exactly what
    // happened when the follow-up "request access" call failed on its own.
    await supabase
      .from('users')
      .update({ id_document_url: filePath, buyer_type: 'auction' })
      .eq('id', user.id)

    // A document only ever gets uploaded because someone wants auction access,
    // so this is the moment an admin needs to know there is something to review.
    const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
    notifyAdminInBackground({
      type: 'id_document_uploaded',
      userId: user.id,
      subject: `ID document uploaded: ${user.name}`,
      body: [
        `${user.name} (${user.email}) uploaded an identity document for auction approval.`,
        ``,
        `Open the admin panel, view the ID, then press "Approve auctions" to let them bid.`,
        ``,
        `Admin panel: ${siteUrl}/en/admin`,
      ].join('\n'),
      metadata: { email: user.email, role: user.role },
    })

    return { success: true, path: filePath }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Upload failed' })
  }
})
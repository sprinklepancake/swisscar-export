// server/api/upload/image.post.ts
// Accepts a multipart image upload and stores it in Supabase Storage.
// The client compresses images before sending, so this size limit is only a
// safety backstop for anything that slips through.
import { getSupabaseAdmin } from '~/server/utils/supabase'

// 15 MB backstop. The client should send ~200-600 KB after compression.
const MAX_BYTES = 15 * 1024 * 1024

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

    // Friendly, specific error instead of a raw 500 / 413.
    if (fileField.data.length > MAX_BYTES) {
      const mb = (fileField.data.length / (1024 * 1024)).toFixed(1)
      throw createError({
        statusCode: 413,
        statusMessage: `This photo is ${mb} MB, which is too large. Please choose a smaller photo — the app normally shrinks photos automatically, so try again.`,
      })
    }

    let mimeType = fileField.type || 'image/jpeg'
    // iPhones sometimes send HEIC/HEIF. Treat them as images; the client
    // compressor converts them to JPEG, but accept them here just in case.
    if (mimeType === 'image/heic' || mimeType === 'image/heif') {
      mimeType = 'image/jpeg'
    }
    if (!mimeType.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only image files are allowed' })
    }

    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `cars/${user.id}/${fileName}`

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.storage
      .from('car-images')
      .upload(filePath, fileField.data, { contentType: mimeType, upsert: false })

    if (error) {
      console.error('[upload/image] Supabase storage error:', error.message)
      throw createError({ statusCode: 500, statusMessage: `Upload failed: ${error.message}` })
    }

    const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[upload/image] Unexpected error:', error?.message || error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Upload failed' })
  }
})
// server/api/upload/image.post.ts
// Accepts a multipart form upload and stores the image in Supabase Storage.
// Returns the public URL of the uploaded file.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    // Read multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file provided' })
    }

    const fileField = formData.find(f => f.name === 'file')
    if (!fileField || !fileField.data) {
      throw createError({ statusCode: 400, statusMessage: 'File field missing' })
    }

    const mimeType = fileField.type || 'image/jpeg'
    if (!mimeType.startsWith('image/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only image files are allowed' })
    }

    // Build a unique file path: cars/{userId}/{timestamp}-{random}.{ext}
    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `cars/${user.id}/${fileName}`

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(filePath, fileField.data, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      throw createError({ statusCode: 500, statusMessage: `Upload failed: ${error.message}` })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Upload failed' })
  }
})
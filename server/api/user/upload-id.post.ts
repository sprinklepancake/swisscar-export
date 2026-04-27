// server/api/user/upload-id.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

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
    const filePath = `id-documents/${fileName}`

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(filePath, fileField.data, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('ID upload error:', error)
      throw createError({ statusCode: 500, statusMessage: `Upload failed: ${error.message}` })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath)

    await supabase
      .from('users')
      .update({ id_document_url: publicUrl })
      .eq('id', user.id)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Upload failed' })
  }
})
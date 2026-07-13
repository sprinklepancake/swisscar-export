// composables/useImageCompression.ts
// Shrinks phone photos in the browser BEFORE upload. A typical 8-12 MP iPhone
// photo (4-12 MB) becomes ~200-600 KB JPEG, which fixes the "5 MB photo fails"
// problem and makes uploads far faster on the mobile connections older users
// tend to have. Nuxt auto-imports this, so just call compressImage() anywhere.

export interface CompressOptions {
  maxDimension?: number // longest edge in px
  quality?: number      // 0..1 JPEG quality
  skipUnderKB?: number  // don't bother compressing files already this small
}

export function useImageCompression() {
  async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
    const maxDimension = opts.maxDimension ?? 1600
    const quality = opts.quality ?? 0.8
    const skipUnderKB = opts.skipUnderKB ?? 500

    // Not an image, or already small enough → leave it alone.
    if (!file.type.startsWith('image/')) return file
    if (file.size <= skipUnderKB * 1024 && !file.type.includes('heic') && !file.type.includes('heif')) {
      return file
    }

    try {
      // createImageBitmap respects EXIF orientation on iOS Safari, so photos
      // taken sideways come out the right way up.
      const bitmap = await createImageBitmap(file).catch(async () => {
        // Fallback path for browsers that reject the File directly.
        return await new Promise<ImageBitmap>((resolve, reject) => {
          const img = new Image()
          img.onload = () => createImageBitmap(img).then(resolve).catch(reject)
          img.onerror = reject
          img.src = URL.createObjectURL(file)
        })
      })

      let { width, height } = bitmap
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height / width) * maxDimension)
          width = maxDimension
        } else {
          width = Math.round((width / height) * maxDimension)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(bitmap, 0, 0, width, height)
      bitmap.close?.()

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      )
      if (!blob) return file

      // If compression somehow made it bigger, keep the original.
      if (blob.size >= file.size) return file

      const newName = file.name.replace(/\.(heic|heif|png|webp|jpeg|jpg)$/i, '') + '.jpg'
      return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
    } catch (err) {
      // Never block an upload because compression failed — send the original.
      console.warn('[compressImage] falling back to original file:', err)
      return file
    }
  }

  return { compressImage }
}
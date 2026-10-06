import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MENU_IMAGE_BUCKET } from '@/lib/storage'
import { checkRateLimit, RATE_LIMIT_MESSAGE, RATE_LIMITS } from '@/lib/rate-limit'

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024 // 4.5MB, matches client-side safety check

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: Request) {
  try {
    // Only admins can upload product images.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return fail('Please log in again to upload photos.', 401)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return fail('You do not have permission to upload photos.', 403)
    }

    const allowed = await checkRateLimit(RATE_LIMITS.upload, user.id)
    if (!allowed) {
      return fail(RATE_LIMIT_MESSAGE, 429)
    }

    const formData = await request.formData()
    const file = formData.get('photo')

    if (!(file instanceof File)) {
      return fail('Please choose a photo.', 400)
    }
    if (!file.type.startsWith('image/')) {
      return fail('That file is not an image.', 400)
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail('That photo is too large. Please pick a smaller one.', 413)
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let optimizedBuffer: Buffer
    try {
      optimizedBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (imageError) {
      console.error('Image processing failed:', imageError)
      return fail('That image could not be read. Try a JPG or PNG.', 400)
    }

    const filename = `${crypto.randomUUID()}.webp`

    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from(MENU_IMAGE_BUCKET)
      .upload(filename, optimizedBuffer, { contentType: 'image/webp' })

    if (error) throw error

    const { data: urlData } = admin.storage.from(MENU_IMAGE_BUCKET).getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return fail('Upload failed. Please try again.', 500)
  }
}
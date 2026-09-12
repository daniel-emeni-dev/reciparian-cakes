import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024 // 4.5MB, matches client-side safety check
const BUCKET = 'menu-images'

export async function POST(request: Request) {
  try {
    // Only admins can upload product images.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`

    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from(BUCKET)
      .upload(filename, optimizedBuffer, { contentType: 'image/webp' })

    if (error) throw error

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

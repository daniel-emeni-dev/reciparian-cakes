import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel cron invokes routes with GET, so this must not be a POST handler.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const provided = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)

  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('expire_stale_orders')

    if (error) throw error

    return NextResponse.json({ success: true, expiredCount: data })
  } catch (err) {
    console.error('Order expiry job failed:', err)
    return NextResponse.json({ success: false, error: 'Expiry job failed' }, { status: 500 })
  }
}
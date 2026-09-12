import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Expires orders stuck at pending_payment for 30+ minutes (abandoned
 * checkouts). Wire this to Vercel Cron, e.g. in vercel.json:
 *
 *   { "crons": [{ "path": "/api/orders/expire", "schedule": "*\/15 * * * *" }] }
 *
 * Protected with CRON_SECRET so it can't be triggered publicly.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('expire_stale_orders')

    if (error) throw error

    return NextResponse.json({ success: true, expiredCount: data })
  } catch (err) {
    console.error('Order expiry job failed:', err)
    return NextResponse.json({ error: 'Expiry job failed' }, { status: 500 })
  }
}

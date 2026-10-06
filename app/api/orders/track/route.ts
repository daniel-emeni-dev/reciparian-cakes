import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { trackOrderSchema } from '@/lib/validations/track'
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE, RATE_LIMITS } from '@/lib/rate-limit'

const NO_STORE = { 'Cache-Control': 'no-store' }

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE })
}

// Phone number and customer details are deliberately not selected.
// The customer already knows them, and this endpoint only needs to show progress.
const ORDER_SELECT = `
  id,
  order_reference,
  status,
  fulfillment_type,
  subtotal,
  delivery_fee,
  total,
  created_at,
  delivery_address,
  delivery_zones ( name )
`

export async function POST(request: Request) {
  try {
    const allowed = await checkRateLimit(RATE_LIMITS.track, await getClientIp())
    if (!allowed) {
      return fail(RATE_LIMIT_MESSAGE, 429)
    }
    const body: unknown = await request.json().catch(() => null)
    const parsed = trackOrderSchema.safeParse(body)

    if (!parsed.success) {
      return fail('Please check your order reference and email.', 400)
    }

    const { reference, email } = parsed.data
    const admin = createAdminClient()

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select(ORDER_SELECT)
      .eq('order_reference', reference)
      .eq('customer_email', email)
      .maybeSingle()

    if (orderError) {
      console.error('Order tracking lookup failed:', orderError)
      return fail('Something went wrong.', 500)
    }

    // Same answer for a wrong reference and a wrong email, so nobody can
    // use this endpoint to find out which references exist.
    if (!order) {
      return fail('We could not find an order with those details.', 404)
    }

    const { id: orderId, ...publicOrder } = order

    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('item_name, quantity, line_total')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Order tracking items lookup failed:', itemsError)
      return fail('Something went wrong.', 500)
    }

    return NextResponse.json(
      { success: true, data: { order: publicOrder, items: items ?? [] } },
      { headers: NO_STORE }
    )
  } catch (error) {
    console.error('Order tracking error:', error)
    return fail('Something went wrong.', 500)
  }
}
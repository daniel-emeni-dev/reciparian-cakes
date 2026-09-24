import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTransaction } from '@/lib/paystack'
import { settlePaidOrder } from '@/lib/orders/settle-payment'

// Matches Paystack's allowed reference characters, so both old and new references pass.
const referenceSchema = z.string().regex(/^[A-Za-z0-9._=-]{10,80}$/)

const NO_STORE = { 'Cache-Control': 'no-store' }

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE })
}

const ORDER_SELECT = `
  id,
  order_reference,
  status,
  fulfillment_type,
  subtotal,
  delivery_fee,
  total,
  customer_name,
  customer_email,
  user_id,
  delivery_address,
  pickup_notes,
  delivery_zones ( name )
`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsedReference = referenceSchema.safeParse(searchParams.get('reference'))

    if (!parsedReference.success) {
      return fail('Invalid reference', 400)
    }

    const orderReference = parsedReference.data
    const wantsLiveCheck = searchParams.get('live') === '1'
    const admin = createAdminClient()

    // Phone number is deliberately not selected: anyone holding the reference
    // can call this endpoint, so it only returns what the confirmation screen shows.
    const loadOrder = () =>
      admin.from('orders').select(ORDER_SELECT).eq('order_reference', orderReference).maybeSingle()

    let { data: order, error: orderError } = await loadOrder()

    if (orderError) {
      console.error('Order status lookup failed:', orderError)
      return fail('Something went wrong.', 500)
    }

    if (!order) {
      return fail('Order not found', 404)
    }

    // Only worth asking Paystack when our own record still says unpaid, and
    // only when the page explicitly asks (see OrderStatus.tsx). A failed
    // live check never breaks the normal response, it just falls back to
    // whatever Supabase already has.
    if (wantsLiveCheck && order.status === 'pending_payment') {
      try {
        const verification = await verifyTransaction(orderReference)

        await settlePaidOrder(orderReference, {
          amount: verification.data.amount,
          currency: verification.data.currency,
          status: verification.data.status,
        })

        const refreshed = await loadOrder()
        if (!refreshed.error && refreshed.data) {
          order = refreshed.data
        }
      } catch (liveError) {
        console.error('Order status: live Paystack check failed', liveError)
      }
    }

    const { id: orderId, ...publicOrder } = order

    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('item_name, quantity, line_total')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Order items lookup failed:', itemsError)
      return fail('Something went wrong.', 500)
    }

    return NextResponse.json(
      { success: true, data: { order: publicOrder, items: items ?? [] } },
      { headers: NO_STORE }
    )
  } catch (err) {
    console.error('Order status error:', err)
    return fail('Something went wrong.', 500)
  }
}
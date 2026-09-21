import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

// Matches Paystack's allowed reference characters, so both old and new references pass.
const referenceSchema = z.string().regex(/^[A-Za-z0-9._=-]{10,80}$/)

const NO_STORE = { 'Cache-Control': 'no-store' }

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsedReference = referenceSchema.safeParse(searchParams.get('reference'))

    if (!parsedReference.success) {
      return fail('Invalid reference', 400)
    }

    const admin = createAdminClient()

    // Phone number is deliberately not selected: anyone holding the reference
    // can call this endpoint, so it only returns what the confirmation screen shows.
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select(
        `
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
      )
      .eq('order_reference', parsedReference.data)
      .maybeSingle()

    if (orderError) {
      console.error('Order status lookup failed:', orderError)
      return fail('Something went wrong.', 500)
    }

    if (!order) {
      return fail('Order not found', 404)
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

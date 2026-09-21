import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: order, error } = await admin
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
      customer_phone,
      user_id,
      delivery_address,
      pickup_notes,
      delivery_zones ( name )
    `
    )
    .eq('order_reference', reference)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data: items } = await admin
    .from('order_items')
    .select('item_name, quantity, line_total')
    .eq('order_id', order.id)

  // Don't leak the internal id to the client — it's not needed there.
  const { id: _id, ...orderWithoutId } = order

  return NextResponse.json({ order: orderWithoutId, items: items ?? [] })
}

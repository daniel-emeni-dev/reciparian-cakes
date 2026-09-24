import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminOrderAlert } from '@/lib/email/admin-alert'

const ALREADY_PAID_STATUSES = [
  'paid',
  'awaiting_dispatch',
  'ready_for_prep',
  'out_for_delivery',
  'completed',
] as const

// An expired order can still receive money (bank transfers settle late), so
// expired is a valid starting point alongside pending_payment.
const PAYABLE_STATUSES = ['pending_payment', 'expired'] as const

interface ChargeDetails {
  amount: number
  currency: string
  status: string
}

export type SettleOutcome =
  | 'applied'
  | 'already_paid'
  | 'not_payable'
  | 'amount_mismatch'
  | 'not_usable'
  | 'not_found'

/**
 * The single place that turns a successful Paystack charge into a paid
 * order. Both the webhook and the status route's live fallback call this,
 * so an order can only ever be marked paid through one path with one set
 * of checks. The status filter on the update makes this the atomic gate:
 * if two callers race (a late webhook and a live check), only one wins.
 */
export async function settlePaidOrder(
  orderReference: string,
  charge: ChargeDetails
): Promise<{ outcome: SettleOutcome }> {
  if (charge.status !== 'success' || charge.currency !== 'NGN') {
    return { outcome: 'not_usable' }
  }

  const admin = createAdminClient()

  const { data: order, error: fetchError } = await admin
    .from('orders')
    .select('id, total, status, fulfillment_type')
    .eq('paystack_reference', orderReference)
    .maybeSingle()

  if (fetchError) {
    console.error('settlePaidOrder: order lookup failed', fetchError)
    throw fetchError
  }

  if (!order) return { outcome: 'not_found' }

  if (ALREADY_PAID_STATUSES.includes(order.status as (typeof ALREADY_PAID_STATUSES)[number])) {
    return { outcome: 'already_paid' }
  }

  if (!PAYABLE_STATUSES.includes(order.status as (typeof PAYABLE_STATUSES)[number])) {
    console.error('settlePaidOrder: payment received for non payable order', {
      orderReference,
      orderStatus: order.status,
    })
    return { outcome: 'not_payable' }
  }

  if (order.total !== charge.amount) {
    console.error('settlePaidOrder: amount mismatch', {
      orderReference,
      expected: order.total,
      received: charge.amount,
    })
    return { outcome: 'amount_mismatch' }
  }

  const nextStatus = order.fulfillment_type === 'delivery' ? 'awaiting_dispatch' : 'ready_for_prep'

  const { data: updated, error: updateError } = await admin
    .from('orders')
    .update({ status: nextStatus, paid_at: new Date().toISOString() })
    .eq('id', order.id)
    .in('status', PAYABLE_STATUSES)
    .select('id')

  if (updateError) {
    console.error('settlePaidOrder: failed to update order', updateError)
    throw updateError
  }

  if (!updated || updated.length === 0) {
    // Another caller (webhook or a second live check) won the race.
    return { outcome: 'already_paid' }
  }

  if (order.status === 'expired') {
    console.warn('settlePaidOrder: late payment recovered for expired order', { orderReference })
  }

  try {
    const { data: fullOrder, error: alertFetchError } = await admin
      .from('orders')
      .select(
        `
        order_reference, customer_name, customer_phone, fulfillment_type,
        delivery_address, pickup_notes, subtotal, delivery_fee, total, paid_at,
        delivery_zones ( name ),
        order_items ( item_name, quantity, line_total, custom_cake_config )
      `
      )
      .eq('id', order.id)
      .single()

    if (alertFetchError || !fullOrder) {
      throw alertFetchError ?? new Error('Order not found for alert email')
    }

    await sendAdminOrderAlert({
      orderReference: fullOrder.order_reference,
      customerName: fullOrder.customer_name,
      customerPhone: fullOrder.customer_phone,
      fulfillmentType: fullOrder.fulfillment_type,
      deliveryZoneName: fullOrder.delivery_zones?.name ?? null,
      deliveryAddress: fullOrder.delivery_address,
      pickupNotes: fullOrder.pickup_notes,
      subtotal: fullOrder.subtotal,
      deliveryFee: fullOrder.delivery_fee,
      total: fullOrder.total,
      paidAt: fullOrder.paid_at ?? new Date().toISOString(),
      items: fullOrder.order_items.map((item) => ({
        itemName: item.item_name,
        quantity: item.quantity,
        lineTotal: item.line_total,
        customCakeConfig: item.custom_cake_config,
      })),
    })
  } catch (alertError) {
    // Same rule as before: an email failure must never fail a payment update.
    console.error('settlePaidOrder: admin alert email failed', alertError)
  }

  return { outcome: 'applied' }
}
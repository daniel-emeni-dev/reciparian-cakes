import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature } from '@/lib/paystack'

const eventEnvelopeSchema = z.object({ event: z.string() })

const chargeSuccessSchema = z.object({
  data: z.object({
    reference: z.string().min(1),
    amount: z.number().int(),
    currency: z.string(),
    status: z.string(),
  }),
})

const ALREADY_PAID_STATUSES = ['paid', 'awaiting_dispatch', 'ready_for_prep', 'completed'] as const

// An expired order can still receive money (bank transfers settle late), so
// expired is a valid starting point alongside pending_payment.
const PAYABLE_STATUSES = ['pending_payment', 'expired'] as const

function acknowledge() {
  return NextResponse.json({ success: true })
}

function reject(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!verifyPaystackSignature(rawBody, signature)) {
      console.error('Paystack webhook: invalid signature')
      return reject('Invalid signature', 401)
    }

    let payload: unknown
    try {
      payload = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Paystack webhook: body is not valid JSON', parseError)
      return reject('Invalid payload', 400)
    }

    const envelope = eventEnvelopeSchema.safeParse(payload)
    if (!envelope.success) {
      console.error('Paystack webhook: missing event name')
      return reject('Invalid payload', 400)
    }

    // Acknowledge events we don't act on so Paystack stops retrying them.
    if (envelope.data.event !== 'charge.success') {
      return acknowledge()
    }

    const charge = chargeSuccessSchema.safeParse(payload)
    if (!charge.success) {
      console.error('Paystack webhook: unexpected charge.success shape', charge.error.flatten())
      return reject('Invalid payload', 400)
    }

    const { reference, amount, currency, status } = charge.data.data

    if (status !== 'success' || currency !== 'NGN') {
      console.error('Paystack webhook: charge not usable', { reference, status, currency })
      return acknowledge()
    }

    const admin = createAdminClient()

    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('id, total, status, fulfillment_type')
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (fetchError) {
      // A 500 makes Paystack retry, which is what we want for a transient DB failure.
      console.error('Paystack webhook: order lookup failed', fetchError)
      return reject('Lookup failed', 500)
    }

    if (!order) {
      console.error('Paystack webhook: order not found for reference', reference)
      return reject('Order not found', 404)
    }

    if (ALREADY_PAID_STATUSES.includes(order.status as (typeof ALREADY_PAID_STATUSES)[number])) {
      return acknowledge()
    }

    if (!PAYABLE_STATUSES.includes(order.status as (typeof PAYABLE_STATUSES)[number])) {
      // Money arrived for an order we should not fulfil (e.g. cancelled): needs a manual refund.
      console.error('Paystack webhook: payment received for non payable order', {
        reference,
        orderStatus: order.status,
      })
      return acknowledge()
    }

    if (order.total !== amount) {
      console.error('Paystack webhook: amount mismatch', {
        reference,
        expected: order.total,
        received: amount,
      })
      return reject('Amount mismatch', 400)
    }

    const nextStatus = order.fulfillment_type === 'delivery' ? 'awaiting_dispatch' : 'ready_for_prep'

    // The status filter makes this the single atomic gate: when two webhook
    // deliveries race, only one update matches a row, so only one proceeds.
    const { data: updated, error: updateError } = await admin
      .from('orders')
      .update({ status: nextStatus, paid_at: new Date().toISOString() })
      .eq('id', order.id)
      .in('status', PAYABLE_STATUSES)
      .select('id')

    if (updateError) {
      console.error('Paystack webhook: failed to update order', updateError)
      return reject('Update failed', 500)
    }

    if (!updated || updated.length === 0) {
      return acknowledge()
    }

    if (order.status === 'expired') {
      console.warn('Paystack webhook: late payment recovered for expired order', { reference })
    }

    return acknowledge()
  } catch (err) {
    console.error('Paystack webhook error:', err)
    return reject('Webhook processing failed', 500)
  }
}

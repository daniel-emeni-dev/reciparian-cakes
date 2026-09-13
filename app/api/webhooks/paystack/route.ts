import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature } from '@/lib/paystack'

interface PaystackChargeSuccessEvent {
  event: string
  data: {
    reference: string
    amount: number // kobo
    status: string
    metadata: {
      order_id?: string
      order_reference?: string
      fulfillment_type?: 'delivery' | 'pickup'
    }
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!verifyPaystackSignature(rawBody, signature)) {
      console.error('Paystack webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PaystackChargeSuccessEvent

    if (event.event !== 'charge.success') {
      // Acknowledge and ignore events we don't act on.
      return NextResponse.json({ received: true })
    }

    const admin = createAdminClient()
    const { reference, amount } = event.data

    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('id, total, status, fulfillment_type, delivery_zone_id')
      .eq('paystack_reference', reference)
      .single()

    if (fetchError || !order) {
      console.error('Paystack webhook: order not found for reference', reference)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Already processed — Paystack may retry webhooks.
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ received: true })
    }

    if (order.total !== amount) {
      console.error('Paystack webhook: amount mismatch', {
        expected: order.total,
        received: amount,
      })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Branch by fulfillment type.
    const nextStatus = order.fulfillment_type === 'delivery' ? 'awaiting_dispatch' : 'ready_for_prep'

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: nextStatus,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Paystack webhook: failed to update order', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // TODO(next task): trigger admin + customer notifications here
    // (Resend email / WhatsApp click-to-chat) once that integration
    // is scoped — kept out of this pass to stay in scope.

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Paystack webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

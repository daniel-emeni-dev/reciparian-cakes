import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPaystackSignature } from '@/lib/paystack'
import { settlePaidOrder } from '@/lib/orders/settle-payment'

const eventEnvelopeSchema = z.object({ event: z.string() })

const chargeSuccessSchema = z.object({
  data: z.object({
    reference: z.string().min(1),
    amount: z.number().int(),
    currency: z.string(),
    status: z.string(),
  }),
})

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

    let result
    try {
      result = await settlePaidOrder(reference, { amount, currency, status })
    } catch (settleError) {
      // A 500 makes Paystack retry, which is what we want for a transient DB failure.
      console.error('Paystack webhook: settle failed', settleError)
      return reject('Settle failed', 500)
    }

    if (result.outcome === 'not_found') {
      console.error('Paystack webhook: order not found for reference', reference)
    }

    // Payments that could not be applied are reported to the baker by email inside
    // settlePaidOrder. An error status here would only make Paystack retry something
    // that can never succeed.
    return acknowledge()

  } catch (err) {
    console.error('Paystack webhook error:', err)
    return reject('Webhook processing failed', 500)
  }
}
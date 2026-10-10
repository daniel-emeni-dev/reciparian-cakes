import { BAKERY } from '@/lib/bakery'
import { formatNaira } from '@/lib/cart'
import { escapeHtml } from '@/lib/email/escape-html'
import { sendEmail } from '@/lib/resend'

export type UnappliedPaymentReason = 'amount_mismatch' | 'not_payable' | 'not_found'

export interface PaymentReviewAlertInput {
  reason: UnappliedPaymentReason
  orderReference: string
  amountReceivedKobo: number
  expectedAmountKobo: number | null
  orderStatus: string | null
}

const REASON_TEXT: Record<UnappliedPaymentReason, string> = {
  amount_mismatch: 'The amount paid does not match the order total, so the order was not marked as paid.',
  not_payable: 'The order was no longer waiting for payment, for example it was cancelled, so it was not changed.',
  not_found: 'No order on the website matches this payment reference.',
}

function buildDetails(input: PaymentReviewAlertInput): { label: string; value: string }[] {
  const details = [
    { label: 'Reference', value: input.orderReference },
    { label: 'What happened', value: REASON_TEXT[input.reason] },
    { label: 'Amount received', value: formatNaira(input.amountReceivedKobo) },
  ]

  if (input.expectedAmountKobo !== null) {
    details.push({ label: 'Order total', value: formatNaira(input.expectedAmountKobo) })
  }
  if (input.orderStatus !== null) {
    details.push({ label: 'Order status', value: input.orderStatus })
  }

  return details
}

export async function sendPaymentReviewAlert(input: PaymentReviewAlertInput): Promise<void> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL

  if (!adminEmail) {
    throw new Error('ADMIN_ALERT_EMAIL is not set')
  }

  const details = buildDetails(input)
  const safeReference = input.orderReference.replace(/\s+/g, ' ')
  const nextStep =
    'Check this payment in the Paystack dashboard, then contact the customer or refund them if needed.'

  const detailsHtml = details
    .map((detail) => `<p><strong>${detail.label}:</strong> ${escapeHtml(detail.value)}</p>`)
    .join('')

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;">
      <h2>Payment needs review</h2>
      <p>A customer's payment arrived but could not be applied to an order.</p>
      ${detailsHtml}
      <p>${nextStep}</p>
    </div>
  `

  const text = `Payment needs review

A customer's payment arrived but could not be applied to an order.

${details.map((detail) => `${detail.label}: ${detail.value}`).join('\n')}

${nextStep}`

  await sendEmail({
    to: adminEmail,
    from: `${BAKERY.name} <onboarding@resend.dev>`,
    subject: `Payment needs review: ${safeReference}`,
    html,
    text,
  })
}
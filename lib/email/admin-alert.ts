import { formatNaira } from '@/lib/cart'
import { formatDateTime } from '@/lib/format-date'
import { BAKERY } from '@/lib/bakery'
import { describeCakeConfig } from '@/lib/admin-orders'
import { sendEmail } from '@/lib/resend'
import type { Json } from '@/types/database'

export interface AdminAlertItem {
  itemName: string
  quantity: number
  lineTotal: number
  customCakeConfig: Json | null
}

export interface AdminAlertOrder {
  orderReference: string
  customerName: string
  customerPhone: string
  fulfillmentType: 'delivery' | 'pickup'
  deliveryZoneName: string | null
  deliveryAddress: string | null
  pickupNotes: string | null
  subtotal: number
  deliveryFee: number
  total: number
  paidAt: string
  items: AdminAlertItem[]
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildItemLines(items: AdminAlertItem[]): { html: string; text: string } {
  const htmlRows = items
    .map((item) => {
      const details = describeCakeConfig(item.customCakeConfig, {})
      const detailHtml = details
        .map(
          (detail) =>
            `<div style="color:#6b5f5c;font-size:12px;">${escapeHtml(detail.label)}: ${escapeHtml(detail.value)}</div>`
        )
        .join('')

      return `<tr>
        <td style="padding:6px 0;">
          <div>${item.quantity} x ${escapeHtml(item.itemName)}</div>
          ${detailHtml}
        </td>
        <td style="padding:6px 0;text-align:right;">${formatNaira(item.lineTotal)}</td>
      </tr>`
    })
    .join('')

  const textLines = items
    .map((item) => {
      const details = describeCakeConfig(item.customCakeConfig, {})
      const detailText = details.map((detail) => `    ${detail.label}: ${detail.value}`).join('\n')
      const line = `${item.quantity} x ${item.itemName} (${formatNaira(item.lineTotal)})`
      return detailText ? `${line}\n${detailText}` : line
    })
    .join('\n')

  return { html: htmlRows, text: textLines }
}

export async function sendAdminOrderAlert(order: AdminAlertOrder): Promise<void> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL

  if (!adminEmail) {
    throw new Error('ADMIN_ALERT_EMAIL is not set')
  }

  const isDelivery = order.fulfillmentType === 'delivery'
  const { html: itemsHtml, text: itemsText } = buildItemLines(order.items)

  const fulfillmentHtml = isDelivery
    ? `<p>Delivery${order.deliveryZoneName ? ` to ${escapeHtml(order.deliveryZoneName)}` : ''}</p>
       <p>${escapeHtml(order.deliveryAddress ?? '')}</p>`
    : `<p>Pickup at ${escapeHtml(BAKERY.pickupAddress)}</p>
       <p>${escapeHtml(BAKERY.pickupHours)}</p>
       ${order.pickupNotes ? `<p>Notes: ${escapeHtml(order.pickupNotes)}</p>` : ''}`

  const fulfillmentText = isDelivery
    ? `Delivery${order.deliveryZoneName ? ` to ${order.deliveryZoneName}` : ''}\n${order.deliveryAddress ?? ''}`
    : `Pickup at ${BAKERY.pickupAddress}\n${BAKERY.pickupHours}${
        order.pickupNotes ? `\nNotes: ${order.pickupNotes}` : ''
      }`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;">
      <h2>New paid order: ${escapeHtml(order.orderReference)}</h2>
      <p>${escapeHtml(order.customerName)}, ${escapeHtml(order.customerPhone)}</p>
      ${fulfillmentHtml}
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        ${itemsHtml}
      </table>
      <p style="margin-top:12px;">Subtotal: ${formatNaira(order.subtotal)}</p>
      ${isDelivery ? `<p>Delivery fee: ${formatNaira(order.deliveryFee)}</p>` : ''}
      <p style="font-weight:bold;">Total: ${formatNaira(order.total)}</p>
      <p style="color:#6b5f5c;font-size:12px;">Paid ${escapeHtml(formatDateTime(order.paidAt))}</p>
    </div>
  `

  const text = `New paid order: ${order.orderReference}
${order.customerName}, ${order.customerPhone}

${fulfillmentText}

${itemsText}

Subtotal: ${formatNaira(order.subtotal)}
${isDelivery ? `Delivery fee: ${formatNaira(order.deliveryFee)}\n` : ''}Total: ${formatNaira(order.total)}

Paid ${formatDateTime(order.paidAt)}`

  await sendEmail({
    to: adminEmail,
    from: 'Reciparian Cakes <onboarding@resend.dev>',
    subject: `New order: ${order.orderReference}, ${formatNaira(order.total)}`,
    html,
    text,
  })
}
import 'server-only'

export interface OrderEmailItem {
  itemName: string
  quantity: number
  lineTotal: number // kobo
}

export interface OrderEmailData {
  orderReference: string
  customerName: string
  customerEmail: string
  items: OrderEmailItem[]
  subtotal: number // kobo
  deliveryFee: number // kobo
  total: number // kobo
  fulfillmentType: 'delivery' | 'pickup'
  deliveryZoneName?: string
  deliveryAddress?: string
  pickupNotes?: string
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

function itemsListHtml(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:#292524;">${item.quantity}× ${item.itemName}</td>
          <td style="padding:8px 0;text-align:right;color:#292524;">${formatNaira(item.lineTotal)}</td>
        </tr>`
    )
    .join('')
}

function fulfillmentSummaryHtml(data: OrderEmailData): string {
  if (data.fulfillmentType === 'delivery') {
    return `<p style="margin:0 0 4px;"><strong>Delivery to:</strong> ${data.deliveryZoneName ?? ''}</p>
            <p style="margin:0;color:#57534e;">${data.deliveryAddress ?? ''}</p>
            <p style="margin:8px 0 0;color:#57534e;">We'll reach out when the rider is dispatched.</p>`
  }
  return `<p style="margin:0 0 4px;"><strong>Pickup at:</strong> Reciparian Cakes</p>
          <p style="margin:0;color:#57534e;">4 George Amewhule Street, Rumuigbo, Port Harcourt</p>
          <p style="margin:8px 0 0;color:#57534e;">Mon–Sat, 9:00 AM – 5:30 PM. Bring your Order ID: ${data.orderReference}</p>`
}

export function buildCustomerReceiptEmail(data: OrderEmailData): { subject: string; html: string } {
  return {
    subject: `Your Reciparian Cakes order (${data.orderReference}) is confirmed!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;color:#1c1917;">Thank you, ${data.customerName}! 🎂</h1>
        <p style="color:#57534e;">Your order <strong>${data.orderReference}</strong> is confirmed and paid.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          ${itemsListHtml(data.items)}
        </table>

        <table style="width:100%;border-top:1px solid #e7e5e4;padding-top:8px;">
          <tr><td>Subtotal</td><td style="text-align:right;">${formatNaira(data.subtotal)}</td></tr>
          <tr><td>Delivery</td><td style="text-align:right;">${formatNaira(data.deliveryFee)}</td></tr>
          <tr><td style="font-weight:bold;padding-top:8px;">Total</td><td style="text-align:right;font-weight:bold;padding-top:8px;">${formatNaira(data.total)}</td></tr>
        </table>

        <div style="margin-top:20px;padding:16px;background:#FFFEE0;border-radius:12px;">
          ${fulfillmentSummaryHtml(data)}
        </div>

        <p style="margin-top:24px;color:#78716c;font-size:13px;">
          Questions? Call or WhatsApp us at +234 903 004 8881.
        </p>
      </div>
    `,
  }
}

export function buildAdminOrderAlertEmail(
  data: OrderEmailData,
  whatsappUrl: string
): { subject: string; html: string } {
  return {
    subject: `🔔 New order ${data.orderReference} — ${formatNaira(data.total)}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;color:#1c1917;">New paid order</h1>
        <p><strong>${data.orderReference}</strong></p>
        <p>${data.customerName} — ${data.customerEmail}</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          ${itemsListHtml(data.items)}
        </table>

        <p style="font-weight:bold;">Total: ${formatNaira(data.total)}</p>

        <div style="margin-top:12px;padding:16px;background:#FFE0EB;border-radius:12px;">
          ${fulfillmentSummaryHtml(data)}
        </div>

        <a href="${whatsappUrl}" style="display:inline-block;margin-top:16px;padding:10px 16px;background:#25D366;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
          Message customer on WhatsApp
        </a>
      </div>
    `,
  }
}

/**
 * TEMPORARY sender address. recipariancakes.com's DNS is managed by
 * someone else and hasn't been handed over yet, so Resend can't send
 * from orders@recipariancakes.com until that domain is verified.
 * Using Resend's built‑in test sender in the meantime so email
 * sending can still be built and tested end‑to‑end.
 *
 * Swap this one line back once DNS access comes through — nothing
 * else in this file needs to change:
 *   'Reciparian Cakes <orders@recipariancakes.com>'
 */
const EMAIL_FROM = 'Reciparian Cakes <onboarding@resend.dev>'

/**
 * Sends via Resend's REST API directly (no SDK dependency — a plain
 * fetch call is simpler and avoids adding a package for two email
 * sends). Never throws; logs and returns false on failure so a
 * flaky email provider can't take down the webhook that calls this.
 */
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY — email not sent.')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: params.to,
        subject: params.subject,          
        html: params.html,
      }),       
    })       

    if (!response.ok) {
      console.error('Resend send failed:', await response.text())
      return false
    }

    return true
  } catch (err) {
    console.error('Resend send error:', err)
    return false
  }
}

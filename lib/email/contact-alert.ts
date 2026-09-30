import { BAKERY } from '@/lib/bakery'
import { sendEmail } from '@/lib/resend'
import type { ContactInput } from '@/lib/validations/contact'

type ContactEnquiry = Omit<ContactInput, 'website'>

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatEventDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function buildDetails(enquiry: ContactEnquiry): { label: string; value: string }[] {
  const details = [
    { label: 'Name', value: enquiry.name },
    { label: 'Email', value: enquiry.email },
    { label: 'Phone', value: enquiry.phone || 'Not given' },
  ]

  if (enquiry.enquiryType === 'custom_order') {
    details.push(
      { label: 'Event date', value: formatEventDate(enquiry.eventDate) },
      { label: 'Servings', value: enquiry.servings },
      { label: 'Flavor preferences', value: enquiry.flavorPreferences || 'Not given' }
    )
  }

  return details
}

export async function sendContactAlert(enquiry: ContactEnquiry): Promise<void> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL

  if (!adminEmail) {
    throw new Error('ADMIN_ALERT_EMAIL is not set')
  }

  const isCustomOrder = enquiry.enquiryType === 'custom_order'
  const heading = isCustomOrder ? 'New custom order enquiry' : 'New enquiry'
  const safeName = enquiry.name.replace(/\s+/g, ' ')
  const details = buildDetails(enquiry)

  const detailsHtml = details
    .map((detail) => `<p><strong>${detail.label}:</strong> ${escapeHtml(detail.value)}</p>`)
    .join('')

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;">
      <h2>${heading}</h2>
      ${detailsHtml}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(enquiry.message).replace(/\n/g, '<br>')}</p>
      <p style="color:#6b5f5c;font-size:12px;">Hit reply to answer by email, or use the phone above.</p>
    </div>
  `

  const text = `${heading}

${details.map((detail) => `${detail.label}: ${detail.value}`).join('\n')}

Message:
${enquiry.message}`

  await sendEmail({
    to: adminEmail,
    from: `${BAKERY.name} <onboarding@resend.dev>`,
    subject: `${heading}: ${safeName}`,
    html,
    text,
    replyTo: enquiry.email,
  })
}
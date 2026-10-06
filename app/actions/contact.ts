'use server'

import { sendContactAlert } from '@/lib/email/contact-alert'
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE, RATE_LIMITS } from '@/lib/rate-limit';
import { contactSchema } from '@/lib/validations/contact'

export type ContactResult = { success: true } | { success: false; error: string }

export async function submitContact(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: 'Please check the form and try again.' }
  }

  const { website, ...enquiry } = parsed.data

  // Bots fill the hidden field. Reporting success gives them nothing to adapt to.
  if (website !== '') {
    return { success: true }
  }

  const allowed = await checkRateLimit(RATE_LIMITS.contact, await getClientIp())
  if (!allowed) {
    return { success: false, error: RATE_LIMIT_MESSAGE }
  }

  try {
    await sendContactAlert(enquiry)
    return { success: true }
  } catch (error) {
    console.error('Contact enquiry email failed:', error)
    return {
      success: false,
      error: 'We could not send your message right now. Please try again or message us on WhatsApp.',
    }
  }
}
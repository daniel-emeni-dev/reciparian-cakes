const BAKERY_WHATSAPP_NUMBER = '2349030048881'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// wa.me only accepts digits with the country code, so local 0803... numbers are converted.
function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 13 && digits.startsWith('234')) return digits
  if (digits.length === 14 && digits.startsWith('2340')) return `234${digits.slice(4)}`
  if (digits.length === 11 && digits.startsWith('0')) return `234${digits.slice(1)}`

  return null
}

export function buildCustomerWhatsAppLink(phone: string, message: string): string | null {
  const number = toWhatsAppNumber(phone)
  if (!number) return null

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
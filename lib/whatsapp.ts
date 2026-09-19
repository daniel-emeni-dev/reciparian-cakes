const BAKERY_WHATSAPP_NUMBER = '2349030048881'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
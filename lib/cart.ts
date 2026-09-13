import type { CartLineItem } from './validations/checkout'

export interface PricedLine extends CartLineItem {
  itemName: string
  unitPrice: number // kobo
  lineTotal: number // kobo
}

export interface CartTotals {
  subtotal: number // kobo
  deliveryFee: number // kobo
  total: number // kobo
}

/**
 * Sums already-priced line items into a subtotal. Unit prices must
 * come from the database (menu_items.price, custom_cake_pricing.base_price
 * + addon prices) — never from client-supplied numbers.
 */
export function calculateSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0)
}

export function calculateTotals(subtotal: number, deliveryFee: number): CartTotals {
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

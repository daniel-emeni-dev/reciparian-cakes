import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateLineTotal, calculateSubtotal, calculateTotals, type PricedLine } from '@/lib/cart'
import type { CartLineItem } from '@/lib/validations/checkout'

/**
 * A cart line carries both the data checkout needs (itemType,
 * menuItemId or customCakeConfig, quantity) and display fields the
 * drawer and checkout page render without an extra fetch.
 *
 * unitPrice and minQuantity are snapshots for display and for the
 * quantity buttons only. The checkout server action re-prices every
 * line and enforces the real minimum from the database.
 */
export interface CartItem extends CartLineItem {
  cartItemId: string // client generated, stable identity for this line
  itemName: string
  imageUrl: string | null
  unitPrice: number // kobo, display snapshot only
  minQuantity: number // smallest quantity the bakery sells this item in
}

/** minQuantity is optional here so callers that sell one at a time can leave it out. */
export type NewCartItem = Omit<CartItem, 'cartItemId' | 'quantity' | 'minQuantity'> & {
  minQuantity?: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: NewCartItem, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
}

/**
 * Two menu_item lines are "the same" if they reference the same
 * menuItemId. Two custom_cake lines are "the same" only if their
 * full configuration matches exactly (different size, flavor or add ons
 * are genuinely different cakes, not quantities of the same thing).
 */
function findMatchingLine(items: CartItem[], candidate: NewCartItem) {
  return items.find((item) => {
    if (item.itemType !== candidate.itemType) return false

    if (item.itemType === 'menu_item') {
      return item.menuItemId === candidate.menuItemId
    }

    return JSON.stringify(item.customCakeConfig) === JSON.stringify(candidate.customCakeConfig)
  })
}

// crypto.randomUUID only exists on secure origins (https or localhost), so
// testing from a phone over plain http would otherwise crash Add to cart.
function createCartItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity) => {
        const existing = findMatchingLine(get().items, item)

        if (existing) {
          set({
            items: get().items.map((line) =>
              line.cartItemId === existing.cartItemId
                ? { ...line, quantity: line.quantity + (quantity ?? 1) }
                : line
            ),
          })
          return
        }

        // A new line starts at its minimum, so one tap on Add gives a valid order.
        const minQuantity = item.minQuantity ?? 1

        set({
          items: [
            ...get().items,
            {
              ...item,
              minQuantity,
              cartItemId: createCartItemId(),
              quantity: Math.max(quantity ?? minQuantity, minQuantity),
            },
          ],
        })
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((line) => line.cartItemId !== cartItemId) })
      },

      updateQuantity: (cartItemId, quantity) => {
        const line = get().items.find((item) => item.cartItemId === cartItemId)
        if (!line) return

        // Lines with a minimum can only be deleted with removeItem, so a stray
        // tap on the minus button never wipes out a whole batch.
        if (line.minQuantity > 1 && quantity < line.minQuantity) return

        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'reciparian-cart', // localStorage key
      version: 1,
      partialize: (state) => ({ items: state.items }),
      // Carts saved before minQuantity existed cannot be trusted, so they reset once.
      migrate: () => ({ items: [] }),
    }
  )
)

/**
 * Derived totals for display. Reuses the same calculation functions the
 * checkout server action uses, so the drawer subtotal matches checkout
 * (checkout always wins if a price changed since the item was added).
 */
export function useCartTotals() {
  const items = useCartStore((state) => state.items)

  const pricedLines: PricedLine[] = items.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(item.unitPrice, item.quantity),
  }))

  const subtotal = calculateSubtotal(pricedLines)
  return calculateTotals(subtotal, 0) // delivery fee is added at checkout
}
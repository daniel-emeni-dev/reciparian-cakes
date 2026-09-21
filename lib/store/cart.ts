import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateSubtotal, calculateTotals, type PricedLine } from '@/lib/cart'
import type { CartLineItem } from '@/lib/validations/checkout'

/**
 * A cart line carries both the data checkout needs (itemType,
 * menuItemId/customCakeConfig, quantity — matches CartLineItem
 * exactly so it can be sent straight to the checkout server action)
 * and display-only fields the drawer/page need to render without
 * an extra fetch. unitPrice here is a snapshot for display only —
 * the checkout server action always re-prices from the database,
 * per Phase 1's "never trust client prices" rule.
 */
export interface CartItem extends CartLineItem {
  cartItemId: string // client-generated, stable identity for this line
  itemName: string
  imageUrl: string | null
  unitPrice: number // kobo, display snapshot only
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cartItemId' | 'quantity'>, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
}

/**
 * Two menu_item lines are "the same" if they reference the same
 * menuItemId. Two custom_cake lines are "the same" only if their
 * full configuration matches exactly (different size/flavor/addons
 * are genuinely different cakes, not quantities of the same thing).
 */
function findMatchingLine(items: CartItem[], candidate: Omit<CartItem, 'cartItemId' | 'quantity'>) {
  return items.find((item) => {
    if (item.itemType !== candidate.itemType) return false

    if (item.itemType === 'menu_item') {
      return item.menuItemId === candidate.menuItemId
    }

    return JSON.stringify(item.customCakeConfig) === JSON.stringify(candidate.customCakeConfig)
  })
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const existing = findMatchingLine(get().items, item)

        if (existing) {
          set({
            items: get().items.map((line) =>
              line.cartItemId === existing.cartItemId
                ? { ...line, quantity: line.quantity + quantity }
                : line
            ),
          })
          return
        }

        set({
          items: [
            ...get().items,
            {
              ...item,
              cartItemId: crypto.randomUUID(),
              quantity,
            },
          ],
        })
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((line) => line.cartItemId !== cartItemId) })
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set({
          items: get().items.map((line) =>
            line.cartItemId === cartItemId ? { ...line, quantity } : line
          ),
        })
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'reciparian-cart', // localStorage key
    }
  )
)

/**
 * Derived totals for display. Reuses the exact same calculation
 * functions the checkout server action uses, so the drawer/page
 * subtotal always matches what checkout computes (before the
 * server's authoritative re-pricing, which may differ if a price
 * changed since the item was added — checkout always wins).
 */
export function useCartTotals() {
  const items = useCartStore((state) => state.items)

  const pricedLines: PricedLine[] = items.map((item) => ({
    ...item,
    lineTotal: item.unitPrice * item.quantity,
  }))

  const subtotal = calculateSubtotal(pricedLines)
  return calculateTotals(subtotal, 0) // delivery fee added later, at checkout
}

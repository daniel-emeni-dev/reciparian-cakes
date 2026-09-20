'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { calculateItemCount } from '@/lib/cart'
import { useHasMounted } from '@/lib/hooks/use-has-mounted'

export function CartButton() {
  const hasMounted = useHasMounted()
  const savedCount = useCartStore((state) => calculateItemCount(state.items))
  const open = useCartUIStore((state) => state.open)

  // The saved cart only exists in the browser. Showing 0 until mounted keeps
  // the server HTML and the first browser render identical.
  const itemCount = hasMounted ? savedCount : 0

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingCart size={22} aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-pink-medium px-1 text-xs font-bold text-brand-espresso">
          {itemCount}
        </span>
      )}
    </button>
  )
}
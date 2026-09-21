'use client'

import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'

export function CartButton() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  )
  const open = useCartUIStore((state) => state.open)

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      className="relative rounded-full p-2 text-stone-700 transition-colors hover:bg-stone-100"
    >
      <CartIcon />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-pink-medium px-1 text-xs font-bold text-stone-900">
          {itemCount}
        </span>
      )}
    </button>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l.4 2M7 13h10l3-7H5.4M7 13L5.4 5M7 13l-1.5 4h11M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

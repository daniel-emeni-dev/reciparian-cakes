'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Cake, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { removeFromWishlist } from '@/app/actions/wishlist'
import { formatNaira } from '@/lib/cart'
import { useCartStore } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import type { WishlistItem } from '@/lib/wishlist/get-wishlist'

export function WishlistList({ items }: { items: WishlistItem[] }) {
  const [visible, setVisible] = useState(items)
  const [, startTransition] = useTransition()
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartUIStore((state) => state.open)

  function handleAdd(item: WishlistItem) {
    addItem({
      itemType: 'menu_item',
      menuItemId: item.menuItemId,
      itemName: item.name,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      minQuantity: item.minQuantity,
    })
    openCart()
  }

  function handleRemove(item: WishlistItem) {
    setVisible((current) => current.filter((entry) => entry.menuItemId !== item.menuItemId))
    startTransition(async () => {
      const result = await removeFromWishlist(item.menuItemId)
      if (!result.success) {
        setVisible((current) => (current.some((entry) => entry.menuItemId === item.menuItemId) ? current : [item, ...current]))
        toast.error(result.error ?? 'Could not update your wishlist. Please try again.')
        return
      }
      toast.success('Removed from your wishlist')
    })
  }

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted p-8 text-center">
        <p className="text-base font-semibold text-foreground">Nothing saved yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on any item in the menu to save it here.
        </p>
        <a
          href="/menu"
          className="mt-5 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse the menu
        </a>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {visible.map((item) => (
        <li
          key={item.menuItemId}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 sm:p-4"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.imageAltText}
                fill
                sizes="80px"
                className={item.soldOut ? 'object-cover grayscale' : 'object-cover'}
              />
            ) : (
              <div
                role="img"
                aria-label={item.imageAltText}
                className="flex h-full w-full items-center justify-center text-muted-foreground"
              >
                <Cake size={24} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">{formatNaira(item.price)}</p>
            {item.minQuantity > 1 && (
              <p className="text-xs text-muted-foreground">Minimum order {item.minQuantity}</p>
            )}
            <button
              type="button"
              disabled={item.soldOut}
              onClick={() => handleAdd(item)}
              className="mt-2 min-h-10 rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-brand-espresso shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {item.soldOut ? 'Sold out' : item.minQuantity > 1 ? `Add ${item.minQuantity} to cart` : 'Add to cart'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleRemove(item)}
            aria-label={`Remove ${item.name} from wishlist`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
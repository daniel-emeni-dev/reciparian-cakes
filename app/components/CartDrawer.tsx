'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCartStore, useCartTotals } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { calculateLineTotal, formatNaira } from '@/lib/cart'
import { EmptyCartState } from '@/app/components/EmptyCartState'

const stepperButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

export function CartDrawer() {
  const isOpen = useCartUIStore((state) => state.isOpen)
  const close = useCartUIStore((state) => state.close)
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const totals = useCartTotals()
  const router = useRouter()

  // The page behind the drawer must not scroll while it is open, and
  // Escape should close it like any other dialog.
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  function goToCheckout() {
    close()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-brand-espresso/40"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyCartState onNavigate={close} />
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.cartItemId} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.itemName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNaira(item.unitPrice)} each
                        </p>
                        {item.minQuantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Minimum order {item.minQuantity}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            disabled={item.minQuantity > 1 && item.quantity <= item.minQuantity}
                            aria-label={`Decrease quantity of ${item.itemName}`}
                            className={stepperButtonClass}
                          >
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span className="w-6 text-center text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.itemName}`}
                            className={stepperButtonClass}
                          >
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {formatNaira(calculateLineTotal(item.unitPrice, item.quantity))}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          aria-label={`Remove ${item.itemName}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatNaira(totals.subtotal)}
                  </span>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Delivery fee is calculated at checkout based on your zone.
                </p>
                <button
                  type="button"
                  onClick={goToCheckout}
                  className="min-h-11 w-full rounded-xl bg-brand-green py-3 text-sm font-semibold text-brand-espresso shadow-sm transition hover:brightness-95"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
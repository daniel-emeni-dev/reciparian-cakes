'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCartStore, useCartTotals } from '@/lib/store/cart'
import { useCartUIStore } from '@/lib/store/cart-ui'
import { formatNaira } from '@/lib/cart'

export function CartDrawer() {
  const isOpen = useCartUIStore((state) => state.isOpen)
  const close = useCartUIStore((state) => state.close)
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const totals = useCartTotals()
  const router = useRouter()

  function goToCheckout() {
    close()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — fades in/out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />

          {/* Panel — slides in from the right, fades with it */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h2 className="text-lg font-bold text-stone-900">Your Cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="mt-8 text-center text-stone-500">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.cartItemId} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-stone-900">{item.itemName}</p>
                        <p className="text-sm text-stone-500">{formatNaira(item.unitPrice)}</p>

                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-semibold text-stone-900">
                          {formatNaira(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          aria-label={`Remove ${item.itemName}`}
                          className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-stone-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold text-stone-900">
                    {formatNaira(totals.subtotal)}
                  </span>
                </div>
                <p className="mb-3 text-xs text-stone-400">
                  Delivery fee calculated at checkout based on your zone.
                </p>
                <button
                  type="button"
                  onClick={goToCheckout}
                  className="w-full rounded-xl bg-brand-green py-3 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:brightness-95"
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

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v13a1 1 0 01-1 1H7a1 1 0 01-1-1V7h12zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

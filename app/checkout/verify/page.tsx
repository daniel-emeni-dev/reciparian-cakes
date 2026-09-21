'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { formatNaira } from '@/lib/cart'
import { PostCheckoutAccountPrompt } from '@/app/components/PostCheckoutAccountPrompt'

interface OrderStatusResponse {
  order: {
    order_reference: string
    status: string
    fulfillment_type: 'delivery' | 'pickup'
    subtotal: number
    delivery_fee: number
    total: number
    customer_name: string
    customer_email: string
    customer_phone: string
    user_id: string | null
    delivery_address: string | null
    pickup_notes: string | null
    delivery_zones: { name: string } | null
  }
  items: { item_name: string; quantity: number; line_total: number }[]
}

const PAID_STATUSES = new Set(['paid', 'awaiting_dispatch', 'ready_for_prep', 'completed'])

export default function CheckoutVerifyPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [data, setData] = useState<OrderStatusResponse | null>(null)
  const [notFound, setNotFound] = useState(false)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (!reference) return

    let cancelled = false
    let cartCleared = false

    async function poll() {
      try {
        const res = await fetch(`/api/orders/status?reference=${encodeURIComponent(reference!)}`)
        if (!res.ok) {
          if (!cancelled) setNotFound(true)
          return
        }
        const json: OrderStatusResponse = await res.json()
        if (cancelled) return

        setData(json)

        if (PAID_STATUSES.has(json.order.status) && !cartCleared) {
          clearCart()
          cartCleared = true
        }

        // Keep polling while still pending — webhook confirmation is async.
        if (json.order.status === 'pending_payment') {
          setTimeout(poll, 3000)
        }
      } catch {
        if (!cancelled) setTimeout(poll, 3000)
      }
    }

    poll()
    return () => {
      cancelled = true
    }
  }, [reference, clearCart])

  if (!reference || notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <p className="text-stone-600">We couldn&apos;t find that order.</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="mt-4 text-stone-600">Loading your order...</p>
        </div>
      </main>
    )
  }

  const { order, items } = data
  const isPending = order.status === 'pending_payment'
  const isPaid = PAID_STATUSES.has(order.status)

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-16">
      <div className="mx-auto max-w-lg">
        {isPending && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            <h1 className="mt-4 text-xl font-bold text-stone-900">Processing your payment...</h1>
            <p className="mt-2 text-sm text-stone-600">
              This usually takes just a few seconds. Don&apos;t close this page.
            </p>
          </div>
        )}

        {isPaid && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <h1 className="text-2xl font-bold text-stone-900">Thank you! 🎂</h1>
            <p className="mt-1 text-sm text-stone-600">
              Order <span className="font-semibold">{order.order_reference}</span> is confirmed.
            </p>

            <ul className="mt-6 divide-y divide-stone-100">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.quantity}× {item.item_name}
                  </span>
                  <span className="font-medium">{formatNaira(item.line_total)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatNaira(order.total)}</span>
            </div>

            <div className="mt-6 rounded-xl bg-brand-cream p-4 text-sm text-stone-700">
              {order.fulfillment_type === 'delivery' ? (
                <>
                  <p className="font-semibold">Delivery to {order.delivery_zones?.name}</p>
                  <p className="mt-1">{order.delivery_address}</p>
                  <p className="mt-2 text-stone-600">
                    We&apos;ll reach out when the rider is dispatched.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Pickup at Reciparian Cakes</p>
                  <p className="mt-1">4 George Amewhule Street, Rumuigbo, Port Harcourt</p>
                  <p className="mt-2 text-stone-600">
                    Mon–Sat, 9:00 AM – 5:30 PM. Bring your Order ID: {order.order_reference}
                  </p>
                </>
              )}
            </div>

            {order.user_id === null && (
              <PostCheckoutAccountPrompt
                prefillEmail={order.customer_email}
                prefillName={order.customer_name}
              />
            )}
          </div>
        )}

        {!isPending && !isPaid && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-stone-900">There was an issue</h1>
            <p className="mt-2 text-sm text-stone-600">
              Order status: {order.status}. Please contact us if you were charged.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

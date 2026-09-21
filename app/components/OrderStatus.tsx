'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cart'
import { formatNaira } from '@/lib/cart'
import { BAKERY } from '@/lib/bakery'
import { PostCheckoutAccountPrompt } from '@/app/components/PostCheckoutAccountPrompt'

const POLL_INTERVAL_MS = 3_000
// Bank transfers can lag, but polling forever helps nobody: stop and explain instead.
const POLL_TIMEOUT_MS = 120_000
const PAID_STATUSES = new Set(['paid', 'awaiting_dispatch', 'ready_for_prep', 'completed'])

const orderStatusResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    order: z.object({
      order_reference: z.string(),
      status: z.string(),
      fulfillment_type: z.enum(['delivery', 'pickup']),
      total: z.number(),
      customer_name: z.string(),
      customer_email: z.string(),
      user_id: z.string().nullable(),
      delivery_address: z.string().nullable(),
      delivery_zones: z.object({ name: z.string() }).nullable(),
    }),
    items: z.array(
      z.object({
        item_name: z.string(),
        quantity: z.number(),
        line_total: z.number(),
      })
    ),
  }),
})

type OrderData = z.infer<typeof orderStatusResponseSchema>['data']

type ViewState =
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'order'; data: OrderData }

const primaryButtonClass =
  'mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'

function getFailureCopy(status: string, reference: string) {
  const contactLine = `If you were charged, contact us with your order reference ${reference} and we will sort it out.`

  if (status === 'expired') {
    return {
      title: 'This order expired',
      body: `Payment was not confirmed in time. ${contactLine}`,
    }
  }
  if (status === 'cancelled') {
    return { title: 'This order was cancelled', body: contactLine }
  }
  return { title: 'We could not confirm this order', body: contactLine }
}

function Card({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      {children}
    </motion.div>
  )
}

function MessageCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <Card>
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {children}
    </Card>
  )
}

function OrderSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-4" aria-hidden="true">
        <div className="h-7 w-2/3 rounded-md bg-border" />
        <div className="h-4 w-1/2 rounded-md bg-border" />
        <div className="space-y-3 pt-4">
          <div className="h-4 w-full rounded-md bg-border" />
          <div className="h-4 w-full rounded-md bg-border" />
          <div className="h-4 w-3/4 rounded-md bg-border" />
        </div>
        <div className="h-24 rounded-xl bg-border" />
      </div>
      <span className="sr-only">Loading your order</span>
    </Card>
  )
}

function ConfirmedOrder({ order, items }: OrderData) {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-foreground">Thank you! 🎂</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Order <span className="font-semibold text-foreground">{order.order_reference}</span> is confirmed.
      </p>

      <ul className="mt-6 divide-y divide-border">
        {items.map((item, index) => (
          <li key={`${item.item_name}-${index}`} className="flex justify-between gap-4 py-2 text-sm text-foreground">
            <span>
              {item.quantity}× {item.item_name}
            </span>
            <span className="shrink-0 font-medium">{formatNaira(item.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
        <span>Total</span>
        <span>{formatNaira(order.total)}</span>
      </div>

      <div className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
        {order.fulfillment_type === 'delivery' ? (
          <>
            <p className="font-semibold">Delivery to {order.delivery_zones?.name}</p>
            <p className="mt-1">{order.delivery_address}</p>
            <p className="mt-2 text-muted-foreground">We&apos;ll reach out when the rider is dispatched.</p>
          </>
        ) : (
          <>
            <p className="font-semibold">Pickup at {BAKERY.name}</p>
            <p className="mt-1">{BAKERY.pickupAddress}</p>
            <p className="mt-2 text-muted-foreground">
              {BAKERY.pickupHours}. Bring your Order ID: {order.order_reference}
            </p>
          </>
        )}
      </div>

      {order.user_id === null && (
        <PostCheckoutAccountPrompt prefillEmail={order.customer_email} prefillName={order.customer_name} />
      )}
    </Card>
  )
}

interface OrderStatusProps {
  reference: string | null
}

export function OrderStatus({ reference }: OrderStatusProps) {
  const [view, setView] = useState<ViewState>({ kind: 'loading' })
  const [timedOut, setTimedOut] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (!reference) return

    const orderReference = reference
    const controller = new AbortController()
    const startedAt = Date.now()
    let timer: ReturnType<typeof setTimeout> | undefined

    async function poll() {
      try {
        const res = await fetch(`/api/orders/status?reference=${encodeURIComponent(orderReference)}`, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (res.status === 404 || res.status === 400) {
          setView({ kind: 'not_found' })
          return
        }
        if (!res.ok) {
          throw new Error(`Status request failed with ${res.status}`)
        }

        const parsed = orderStatusResponseSchema.safeParse(await res.json())
        if (!parsed.success) {
          throw new Error('Unexpected status response shape')
        }

        const { data } = parsed.data
        setView({ kind: 'order', data })

        if (PAID_STATUSES.has(data.order.status)) {
          clearCart()
          return
        }
        if (data.order.status !== 'pending_payment') return
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Order status poll failed:', error)
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setTimedOut(true)
        return
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      controller.abort()
      if (timer) clearTimeout(timer)
    }
  }, [reference, attempt, clearCart])

  function handleRetry() {
    setTimedOut(false)
    setAttempt((current) => current + 1)
  }

  if (!reference || view.kind === 'not_found') {
    return (
      <MessageCard
        title="We could not find that order"
        body="Check the link from your payment page, or head back to the menu."
      >
        <Link href="/menu" className={primaryButtonClass}>
          Back to menu
        </Link>
      </MessageCard>
    )
  }

  if (view.kind === 'loading') {
    if (timedOut) {
      return (
        <MessageCard title="We could not load your order" body="Check your connection and try again.">
          <button type="button" onClick={handleRetry} className={primaryButtonClass}>
            Try again
          </button>
        </MessageCard>
      )
    }
    return <OrderSkeleton />
  }

  const { order, items } = view.data

  if (PAID_STATUSES.has(order.status)) {
    return <ConfirmedOrder order={order} items={items} />
  }

  if (order.status === 'pending_payment') {
    if (timedOut) {
      return (
        <MessageCard
          title="Still confirming your payment"
          body={`Bank transfers can take a few minutes. Your order reference is ${order.order_reference}. If you were charged and this does not update, contact us with that reference.`}
        >
          <button type="button" onClick={handleRetry} className={primaryButtonClass}>
            Check again
          </button>
        </MessageCard>
      )
    }

    return (
      <Card>
        <div role="status" className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <h1 className="mt-4 text-xl font-bold text-foreground">Confirming your payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes a few seconds. Please keep this page open.
          </p>
        </div>
      </Card>
    )
  }

  const failure = getFailureCopy(order.status, order.order_reference)

  return (
    <MessageCard title={failure.title} body={failure.body}>
      <Link href="/menu" className={primaryButtonClass}>
        Back to menu
      </Link>
    </MessageCard>
  )
}

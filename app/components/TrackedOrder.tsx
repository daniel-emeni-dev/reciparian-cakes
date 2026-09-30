import clsx from 'clsx'
import { Check } from 'lucide-react'
import { BAKERY } from '@/lib/bakery'
import { formatNaira } from '@/lib/cart'
import { formatDateTime } from '@/lib/format-date'
import { getTrackingView } from '@/lib/orders/tracking'
import type { TrackedOrderData } from '@/lib/validations/track'

export function TrackedOrder({ order, items }: TrackedOrderData) {
  const view = getTrackingView(order.status, order.fulfillment_type)

  return (
    <section aria-live="polite" className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs text-muted-foreground">Order {order.order_reference}</p>
      <h2 className="mt-1 text-xl font-bold text-foreground">{view.headline}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{view.detail}</p>

      {view.steps.length > 0 && (
        <ol className="mt-6 space-y-4">
          {view.steps.map((step) => (
            <li
              key={step.label}
              aria-current={step.state === 'current' ? 'step' : undefined}
              className="flex items-center gap-3"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  step.state === 'done' && 'bg-primary text-primary-foreground',
                  step.state === 'current' && 'bg-brand-pink-medium text-primary ring-2 ring-primary',
                  step.state === 'upcoming' && 'bg-muted text-muted-foreground'
                )}
              >
                {step.state === 'done' ? <Check className="h-4 w-4" /> : null}
              </span>
              <span
                className={clsx(
                  'text-sm',
                  step.state === 'upcoming' ? 'text-muted-foreground' : 'font-semibold text-foreground'
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 rounded-xl bg-muted p-4 text-sm text-foreground">
        {order.fulfillment_type === 'delivery' ? (
          <>
            <p className="font-semibold">Delivery to {order.delivery_zones?.name}</p>
            <p className="mt-1">{order.delivery_address}</p>
          </>
        ) : (
          <>
            <p className="font-semibold">Pickup at {BAKERY.name}</p>
            <p className="mt-1">{BAKERY.pickupAddress}</p>
          </>
        )}
        <p className="mt-2 text-muted-foreground">Placed {formatDateTime(order.created_at)}</p>
      </div>

      <ul className="mt-6 divide-y divide-border">
        {items.map((item, index) => (
          <li key={`${item.item_name}-${index}`} className="flex justify-between gap-4 py-2 text-sm text-foreground">
            <span>
              {item.quantity} x {item.item_name}
            </span>
            <span className="shrink-0 font-medium">{formatNaira(item.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-foreground">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatNaira(order.subtotal)}</span>
        </div>
        {order.fulfillment_type === 'delivery' && (
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery fee</span>
            <span>{formatNaira(order.delivery_fee)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Need help with this order? <a href={BAKERY.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">Message us on WhatsApp</a>.
      </p>
    </section>
  )
}
import { MessageCircle, Phone, Store, Truck } from 'lucide-react'
import { clsx } from 'clsx'
import { formatNaira } from '@/lib/cart'
import { formatDateTime } from '@/lib/format-date'
import { buildCustomerWhatsAppLink } from '@/lib/whatsapp'
import { AdminOrderActions } from '@/app/components/AdminOrderActions'
import {
  ORDER_STATUS_LABELS,
  buildCustomerMessage,
  describeCakeConfig,
  type AdminOrder,
  type OrderStatus,
  getOrderActions
} from '@/lib/admin-orders'

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-muted text-muted-foreground',
  paid: 'bg-brand-green text-brand-espresso',
  awaiting_dispatch: 'bg-brand-pink-medium text-brand-espresso',
  ready_for_prep: 'bg-brand-green text-brand-espresso',
  out_for_delivery: 'bg-brand-yellow text-brand-espresso',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-danger/10 text-danger',
  expired: 'bg-muted text-muted-foreground',
}

const CONTACT_BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted'

interface AdminOrderCardProps {
  order: AdminOrder
  addonNames: Record<string, string>
}

export function AdminOrderCard({ order, addonNames }: AdminOrderCardProps) {

  const isDelivery = order.fulfillment_type === 'delivery'
  const zoneName = order.delivery_zones?.name
  const whatsappLink = buildCustomerWhatsAppLink(
    order.customer_phone,
    buildCustomerMessage(order)
  )

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {order.order_reference}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-foreground">{order.customer_name}</h2>
        </div>
        <span
          className={clsx(
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
            STATUS_STYLES[order.status]
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {order.paid_at
          ? `Paid ${formatDateTime(order.paid_at)}`
          : `Placed ${formatDateTime(order.created_at)}`}
      </p>

      <div className="mt-4 flex items-start gap-2 text-sm text-foreground">
        {isDelivery ? (
          <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Store className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="font-medium">
            {isDelivery ? `Delivery${zoneName ? ` to ${zoneName}` : ''}` : 'Pickup'}
          </p>
          {isDelivery && order.delivery_address && (
            <p className="text-muted-foreground">{order.delivery_address}</p>
          )}
          {order.pickup_notes && (
            <p className="text-muted-foreground">Notes: {order.pickup_notes}</p>
          )}
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-xl bg-muted/60 px-3">
        {order.order_items.map((item) => {
          const details = describeCakeConfig(item.custom_cake_config, addonNames)

          return (
            <li key={item.id} className="py-2.5 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">
                  {item.quantity} × {item.item_name}
                </p>
                <p className="shrink-0 text-foreground">{formatNaira(item.line_total)}</p>
              </div>
              {details.length > 0 && (
                <dl className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex gap-1">
                      <dt>{detail.label}:</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          )
        })}
      </ul>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{formatNaira(order.subtotal)}</dd>
        </div>
        {isDelivery && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery fee</dt>
            <dd className="text-foreground">{formatNaira(order.delivery_fee)}</dd>
          </div>
        )}
        <div className="flex justify-between font-semibold text-foreground">
          <dt>Total</dt>
          <dd>{formatNaira(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={`tel:${order.customer_phone.replace(/\s+/g, '')}`} className={CONTACT_BUTTON}>
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call
        </a>
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={CONTACT_BUTTON}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        )}
        <span className="text-sm text-muted-foreground">{order.customer_phone}</span>
      </div>
      <AdminOrderActions
        orderId={order.id}
        actions={getOrderActions(order.status, order.fulfillment_type)}
      />
    </article>
  )
}
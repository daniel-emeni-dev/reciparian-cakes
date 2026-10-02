import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatNaira } from '@/lib/cart'
import { formatDate } from '@/lib/format-date'
import type { OrderSummary } from '@/lib/orders/history'
import { getTrackingView } from '@/lib/orders/tracking'

function badgeClass(status: string): string {
  if (status === 'completed') return 'bg-brand-green text-foreground'
  if (status === 'cancelled') return 'bg-muted text-muted-foreground'
  return 'bg-brand-pink-medium text-primary'
}

export function OrderHistoryList({ orders }: { orders: OrderSummary[] }) {
  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const label = getTrackingView(order.status, order.fulfillmentType).headline
        const itemLabel = order.itemCount === 1 ? '1 item' : `${order.itemCount} items`

        return (
          <li key={order.orderReference}>
            <Link
              href={`/orders/${encodeURIComponent(order.orderReference)}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-muted sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="break-all text-xs text-muted-foreground">{order.orderReference}</p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(order.createdAt)}, {itemLabel}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(order.status)}`}
                >
                  {label}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-bold text-foreground">{formatNaira(order.total)}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
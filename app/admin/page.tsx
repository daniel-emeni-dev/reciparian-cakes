import type { Metadata } from 'next'
import Link from 'next/link'
import { clsx } from 'clsx'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AdminOrderCard } from '@/app/components/AdminOrderCard'
import { collectAddonIds } from '@/lib/admin-orders'
import {
  ORDER_VIEWS,
  ORDER_VIEW_KEYS,
  type AdminOrder,
} from '@/lib/admin-orders'

export const metadata: Metadata = {
  title: 'Orders',
  robots: { index: false, follow: false },
}

const viewSchema = z.enum(ORDER_VIEW_KEYS).catch('active')
    
export default async function AdminPage({ searchParams }: PageProps<'/admin'>) {
  const { supabase, user } = await requireAdmin()
  const { view: rawView } = await searchParams

  const viewKey = viewSchema.parse(rawView)
  const view = ORDER_VIEWS[viewKey]

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id, order_reference, status, fulfillment_type, customer_name, customer_phone,
      delivery_address, pickup_notes, subtotal, delivery_fee, total, created_at, paid_at,
      delivery_zones ( name ),
      order_items ( id, item_name, quantity, line_total, custom_cake_config )
    `
    )
    .in('status', view.statuses)
    .order('created_at', { ascending: view.oldestFirst })
    .limit(100)

  if (error) {
    console.error('Error loading admin orders:', error.message)
  }

    const orders: AdminOrder[] = data ?? []

  const addonIds = collectAddonIds(orders)
  const addonNames: Record<string, string> = {}

  if (addonIds.length > 0) {
    const { data: addons, error: addonsError } = await supabase
      .from('custom_cake_addons')
      .select('id, name')
      .in('id', addonIds)

    if (addonsError) {
      console.error('Error loading add on names:', addonsError.message)
    }

    for (const addon of addons ?? []) {
      addonNames[addon.id] = addon.name
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
      </header>

      <nav aria-label="Order views" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {ORDER_VIEW_KEYS.map((key) => (
          <Link
            key={key}
            href={key === 'active' ? '/admin' : `/admin?view=${key}`}
            aria-current={key === viewKey ? 'page' : undefined}
            className={clsx(
              'inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors',
              key === viewKey
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-brand-pink'
            )}
          >
            {ORDER_VIEWS[key].label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          We could not load orders. Please refresh the page.
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{view.emptyMessage}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <AdminOrderCard order={order} addonNames={addonNames} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FadeInSection } from '@/app/components/FadeInSection'
import { OrderHistoryList } from '@/app/components/OrderHistoryList'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getMyOrders } from '@/lib/orders/history'

export const metadata: Metadata = {
  title: 'My orders',
  robots: { index: false },
}

export default async function OrdersPage() { 
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const orders = await getMyOrders(user.id)

  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">My orders</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Everything you have ordered from us, newest first.
            </p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          {orders === null ? (
            <p className="rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              We could not load your orders right now. Please refresh in a moment.
            </p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted p-8 text-center">
              <p className="text-base font-semibold text-foreground">No orders yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                When you place an order it will show up here.
              </p>
              <Link
                href="/menu"
                className="mt-5 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse the menu
              </Link>
            </div>
          ) : (
            <OrderHistoryList orders={orders} />
          )}
        </div>
      </FadeInSection>
    </main>        
  )
}
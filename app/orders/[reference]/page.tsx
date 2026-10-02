import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { FadeInSection } from '@/app/components/FadeInSection'
import { TrackedOrder } from '@/app/components/TrackedOrder'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getMyOrderByReference } from '@/lib/orders/history'

export const metadata: Metadata = {
  title: 'Order details',
  robots: { index: false },
}

export default async function OrderDetailPage(props: PageProps<'/orders/[reference]'>) {
  const { reference } = await props.params

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const tracked = await getMyOrderByReference(user.id, reference)
  if (!tracked) notFound()

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Link
          href="/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to my orders
        </Link>
        <FadeInSection>
          <TrackedOrder order={tracked.order} items={tracked.items} />
        </FadeInSection>
      </div>
    </main>
  )
}
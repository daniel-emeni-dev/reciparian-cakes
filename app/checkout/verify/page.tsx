import type { Metadata } from 'next'
import { OrderStatus } from '@/app/components/OrderStatus'

// The reference lives in this page's URL, so keep it out of Referer headers.
export const metadata: Metadata = {
  title: 'Order status',
  referrer: 'no-referrer',
}

interface CheckoutVerifyPageProps {
  searchParams: Promise<{ reference?: string | string[] }>
}

export default async function CheckoutVerifyPage({ searchParams }: CheckoutVerifyPageProps) {
  const { reference } = await searchParams
  const orderReference = Array.isArray(reference) ? (reference[0] ?? null) : (reference ?? null)

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <OrderStatus reference={orderReference} />
      </div>
    </main>
  )
}

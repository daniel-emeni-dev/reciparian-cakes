import type { Metadata } from 'next'
import { FadeInSection } from '@/app/components/FadeInSection'
import { TrackOrderForm } from '@/app/components/TrackOrderForm'

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Check the status of your Reciparian Cakes order.',
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>
}) {
  const { reference } = await searchParams
  const defaultReference = typeof reference === 'string' ? reference : ''

  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-xl">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">Track your order</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your order reference and the email you used at checkout.
            </p>
          </div>
        </section>
      </FadeInSection>

      <div className="mx-auto max-w-xl px-4 py-10">
        <FadeInSection>
          <TrackOrderForm defaultReference={defaultReference} />
        </FadeInSection>
      </div>
    </main>
  )
}
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { FadeInSection } from '@/app/components/FadeInSection'
import { WishlistList } from '@/app/components/WishlistList'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getWishlistItems } from '@/lib/wishlist/get-wishlist'

export const metadata: Metadata = {
  title: 'My wishlist',
  robots: { index: false },
}

export default async function WishlistPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const items = await getWishlistItems(user.id)

  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">My wishlist</h1>
            <p className="mt-3 text-sm text-muted-foreground">Treats you have saved for later.</p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          {items === null ? (
            <p className="rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              We could not load your wishlist right now. Please refresh in a moment.
            </p>
          ) : (
            <WishlistList items={items} />
          )}
        </div>
      </FadeInSection>
    </main>
  )
}
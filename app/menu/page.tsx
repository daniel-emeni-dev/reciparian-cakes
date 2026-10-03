import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getMenuData, getCategories } from '@/app/actions/menu'
import { InteractiveMenu } from '@/app/components/InteractiveMenu'
import { MenuGridSkeleton } from '@/app/components/MenuGridSkeleton'
import { FadeInSection } from '@/app/components/FadeInSection'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getWishlistIds } from '@/lib/wishlist/get-wishlist'

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Browse our full menu of cakes, cupcakes, pastries, and custom cake options. Fresh baked daily in Port Harcourt.',
}

export default async function MenuPage() {
  const [menuItems, categories] = await Promise.all([getMenuData(), getCategories()])
  const user = await getCurrentUser()
  const wishlistIds = user ? await getWishlistIds(user.id) : []

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeInSection>
          <header className="mb-12 text-center">
            <h1 className="font-script text-5xl font-bold text-primary sm:text-6xl">
              Our Fresh Bakery Menu
            </h1>
            <p className="mt-3 text-muted-foreground">
              Baked daily, boutique quality, Port Harcourt made.
            </p>
          </header>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          {/* Suspense is required here because InteractiveMenu reads
              useSearchParams (for the ?category= deep link). Next.js
              needs this boundary for that hook to work correctly. */}
          <Suspense fallback={<MenuGridSkeleton />}>
            <InteractiveMenu
              initialItems={menuItems}
              categories={categories}
              wishlistIds={wishlistIds}
              isSignedIn={user !== null}
            />
          </Suspense>
        </FadeInSection>
      </div>
    </main>
  )
}
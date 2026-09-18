import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Pacifico } from 'next/font/google'
import { getMenuData, getCategories } from '@/app/actions/menu'
import { InteractiveMenu } from '@/app/components/InteractiveMenu'
import { FadeInSection } from '@/app/components/FadeInSection'

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pacifico',
})

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Browse our full menu of cakes, cupcakes, pastries, and custom cake options. Fresh baked daily in Port Harcourt.',
}

export default async function MenuPage() {
  const [menuItems, categories] = await Promise.all([getMenuData(), getCategories()])

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeInSection>
          <header className="mb-12 text-center">
            <h1 className={`${pacifico.className} text-5xl text-stone-900`}>
              Our Fresh Bakery Menu
            </h1>
            <p className="mt-3 text-stone-600">
              Baked daily, boutique quality, Port Harcourt made.
            </p>
          </header>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          {/* Suspense is required here because InteractiveMenu reads
              useSearchParams (for the ?category= deep link) — Next.js
              needs this boundary for that hook to work correctly. */}
          <Suspense fallback={<MenuSkeleton />}>
            <InteractiveMenu initialItems={menuItems} categories={categories} />
          </Suspense>
        </FadeInSection>
      </div>
    </main>
  )
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="aspect-[4/3] bg-stone-100" />
          <div className="space-y-2 p-5">
            <div className="h-3 w-20 rounded bg-stone-100" />
            <div className="h-4 w-32 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

import type { Metadata } from 'next'
import { Pacifico } from 'next/font/google'
import { getMenuData, getCategories } from '@/app/actions/menu'
import { InteractiveMenu } from '@/app/components/InteractiveMenu'

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
        <header className="mb-12 text-center">
          <h1 className={`${pacifico.className} text-5xl text-stone-900`}>
            Our Fresh Bakery Menu
          </h1>
          <p className="mt-3 text-stone-600">Baked daily, boutique quality, Port Harcourt made.</p>
        </header>

        <InteractiveMenu initialItems={menuItems} categories={categories} />
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import {
  getCustomCakePricing,
  getCustomCakeFlavors,
  getCustomCakeAddons,
} from '@/app/actions/custom-cake'
import { CustomCakeConfigurator } from '@/app/components/CustomCakeConfigurator'
import { FadeInSection } from '@/app/components/FadeInSection'

export const metadata: Metadata = {
  title: 'Custom Cakes',
  description:
    'Build your own custom cake — choose finish, size, and flavor. Buttercream or fondant, starting at ₦40,000.',
}

export default async function CustomCakesPage() {
  const [pricing, flavors, addons] = await Promise.all([
    getCustomCakePricing(),
    getCustomCakeFlavors(),
    getCustomCakeAddons(),
  ])

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <FadeInSection>
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-stone-900">Build Your Custom Cake</h1>
            <p className="mt-3 text-stone-600">
              Every custom cake is made to order. Pick your finish, size, and flavor below —
              we&apos;ll confirm any extra details with you directly.
            </p>
          </header>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <CustomCakeConfigurator pricing={pricing} flavors={flavors} addons={addons} />
        </FadeInSection>
      </div>
    </main>
  )
}

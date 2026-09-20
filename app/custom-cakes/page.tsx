import type { Metadata } from 'next'
import {
  getCustomCakePricing,
  getCustomCakeFlavors,
  getCustomCakeAddons,
} from '@/app/actions/custom-cake'
import { BackButton } from '@/app/components/BackButton'
import { CustomCakeConfigurator } from '@/app/components/CustomCakeConfigurator'
import { FadeInSection } from '@/app/components/FadeInSection'

export const metadata: Metadata = {
  title: 'Custom Cakes',
  description:
    'Build your own custom cake. Choose your finish, size and flavor, in buttercream or fondant.',
}

export default async function CustomCakesPage() {
  const [pricing, flavors, addons] = await Promise.all([
    getCustomCakePricing(),
    getCustomCakeFlavors(),
    getCustomCakeAddons(),
  ])

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <BackButton fallbackHref="/menu" />
        </div>

        <FadeInSection>
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">Build Your Custom Cake</h1>
            <p className="mt-3 text-muted-foreground">
              Every custom cake is made to order. Pick your finish, size and flavor below.
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
import { getCategories } from '@/app/actions/menu'
import { getPublishedTestimonials } from '@/app/actions/testimonials'
import { Hero } from '@/app/components/Hero'
import { CategoryShowcase } from '@/app/components/CategoryShowcase'
import { TestimonialsCarousel } from '@/app/components/TestimonialsCarousel'
import { FadeInSection } from '@/app/components/FadeInSection'

export default async function HomePage() {
  const [categories, testimonials] = await Promise.all([
    getCategories(),
    getPublishedTestimonials(),
  ])

  return (
    <main>
      <Hero />

      <CategoryShowcase categories={categories} />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FadeInSection>
            <h2 className="text-center text-3xl font-bold text-stone-900">
              What Our Customers Say
            </h2>
          </FadeInSection>

          <div className="mt-10">
            <FadeInSection delay={0.1}>
              <TestimonialsCarousel testimonials={testimonials} />
            </FadeInSection>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="mx-auto max-w-2xl rounded-2xl bg-brand-cream p-6 text-center text-sm text-stone-700">
            <p>
              <span className="font-semibold">A note on allergens:</span> some of our treats
              contain nuts (coconut, almonds, peanuts, walnuts, pistachios, hazelnuts, and
              more). Have a question about a specific item? Reach us on WhatsApp before you
              order, we&apos;re happy to check.
            </p>
          </div>
        </FadeInSection>
      </section>
    </main>
  )
}

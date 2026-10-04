import { getCategories } from '@/app/actions/menu'
import { getPublishedTestimonials } from '@/app/actions/testimonials'
import { Hero } from '@/app/components/Hero'
import { StatsSection } from '@/app/components/StatsSection'
import { CategoryShowcase } from '@/app/components/CategoryShowcase'
import { TestimonialsCarousel } from '@/app/components/TestimonialsCarousel'
import { FadeInSection } from '@/app/components/FadeInSection'
import Link from 'next/link'
import { FaqAccordion } from '@/app/components/FaqAccordion'
import { HOME_FAQS } from '@/lib/content/faqs'

export default async function HomePage() {
  const [categories, testimonials] = await Promise.all([
    getCategories(),
    getPublishedTestimonials(),
  ])

  return (
    <main>
      <Hero />

      <StatsSection />

      <CategoryShowcase categories={categories} />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FadeInSection>
            <h2 className="text-center text-3xl font-bold text-foreground">
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

            <section aria-labelledby="home-faq-heading" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FadeInSection>
            <h2
              id="home-faq-heading"
              className="text-center text-3xl font-bold text-foreground"
            >
              Quick answers
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <FaqAccordion items={HOME_FAQS} />
            <p className="mt-6 text-center text-sm">
              <Link href="/contact#faq" className="font-medium text-primary underline underline-offset-4">
                See all questions
              </Link>
            </p>
          </FadeInSection>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="mx-auto max-w-2xl rounded-2xl bg-brand-cream p-6 text-center text-sm text-foreground">
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
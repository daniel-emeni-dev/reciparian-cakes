import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { ContactForm } from '@/app/components/ContactForm'
import { FadeInSection } from '@/app/components/FadeInSection'
import { SocialLinks } from '@/app/components/SocialLinks'
import { BAKERY } from '@/lib/bakery'
import { FaqAccordion } from '@/app/components/FaqAccordion'

export const metadata: Metadata = {
  title: 'Contact us',
  description: `Get in touch with ${BAKERY.name} for custom cakes, orders and questions.`,
}

const FAQS = [
  {
    question: 'How long before my order is ready?',
    answer:
      'Every order needs 24 hours. For pickup, the 24 hours starts when you place the order. For delivery, it starts when we mark your order as being prepared, and we deliver after that.',
  },
  {
    question: 'When do you deliver?',
    answer: `Deliveries run from ${BAKERY.deliveryHours}, depending on when your order is ready. The delivery fee depends on your area in Port Harcourt and shows at checkout before you pay.`,
  },
  {
    question: 'What about allergies?',
    answer:
      'Some of our treats contain nuts such as coconut, almonds, peanuts, walnuts, pistachios and hazelnuts, and some are infused with alcohol. Cakes can also hold dowel rods and decorations that are not edible. If you have an allergy, tell us before you order.',
  },
  {
    question: 'Do you offer refunds?',
    answer: `We do not offer refunds on orders or on delivery fees. If something is wrong with your order, message us on WhatsApp at ${BAKERY.phoneDisplay} and tell us what happened.`,
  },
  {
    question: 'How fast do you reply?',
    answer: `We reply to every enquiry ${BAKERY.responseTime}.`,
  },
] as const

const mapQuery = encodeURIComponent(BAKERY.pickupAddress)

function ContactRow({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string
  icon: ReactNode
  label: string
  value: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-pink"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block break-words text-sm font-medium text-foreground">{value}</span>
      </span>
    </a>
  )
}

export default function ContactPage() {
  return (
    <main className="bg-background">
      <FadeInSection>
        <section className="bg-brand-pink px-4 py-14 text-center sm:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">Contact us</p>
            <h1 className="mt-2 text-3xl font-bold text-primary sm:text-5xl">Let us talk cake</h1>
            <p className="mt-4 text-base text-muted-foreground">
              Planning a celebration or have a question about an order? Send us a message and we
              reply {BAKERY.responseTime}.
            </p>
          </div>
        </section>
      </FadeInSection>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        <FadeInSection>
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-muted p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-foreground">Reach us directly</h2>
                <div className="mt-3 space-y-1">
                  <ContactRow
                    href={BAKERY.phoneHref}
                    icon={<Phone className="h-5 w-5" aria-hidden="true" />}
                    label="Call us"
                    value={BAKERY.phoneDisplay}
                  />
                  <ContactRow
                    href={BAKERY.whatsappHref}
                    icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
                    label="Chat on WhatsApp"
                    value={BAKERY.phoneDisplay}
                    external
                  />
                  <ContactRow
                    href={`mailto:${BAKERY.email}`}
                    icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                    label="Email us"
                    value={BAKERY.email}
                  />
                  <ContactRow
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
                    label="Visit us"
                    value={BAKERY.pickupAddress}
                    external
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted p-4 sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                  Hours
                </h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Bakery and pickup</dt>
                    <dd className="font-medium text-foreground">{BAKERY.openingHours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Deliveries</dt>
                    <dd className="font-medium text-foreground">{BAKERY.deliveryHours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Enquiry replies</dt>
                    <dd className="font-medium text-foreground">We reply {BAKERY.responseTime}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">Send us a message</h2>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Choose custom order if you want a cake made for a date.
              </p>
              <ContactForm />
            </div>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-center text-2xl font-bold text-primary">
              Questions we get a lot
            </h2>
            <FaqAccordion items={FAQS} />
          </section>
        </FadeInSection>

        <FadeInSection>
          <section aria-labelledby="pickup-heading" className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 id="pickup-heading" className="text-2xl font-bold text-primary">
                Pickup instructions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{BAKERY.pickupAddress}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                <li>Pickup orders are ready 24 hours after you place them.</li>
                <li>We are open {BAKERY.openingHours}.</li>
                <li>Show your order reference when you arrive.</li>
              </ul>
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get directions
              </a>
            </div>
            <iframe
              title={`Map showing ${BAKERY.name} at ${BAKERY.pickupAddress}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full rounded-2xl border border-border sm:h-96"
            />
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="rounded-2xl bg-brand-pink px-4 py-10 text-center">
            <h2 className="text-2xl font-bold text-primary">Follow along</h2>
            <p className="mb-5 mt-2 text-sm text-muted-foreground">
              We love seeing your photos. Tag us when you share your order.
            </p>
            <SocialLinks />
          </section>
        </FadeInSection>
      </div>
    </main>
  )
}
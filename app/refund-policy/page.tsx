import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/app/components/LegalPage'
import { BAKERY } from '@/lib/bakery'

export const metadata: Metadata = {
  title: 'Refund policy',
  description: `How refunds and complaints work at ${BAKERY.name}.`,
}

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund policy" updated="2 Oct 2026">
      <LegalSection heading="No refunds">
        <p>
          Every order is made fresh for you, so we do not offer refunds on orders. We also do
          not refund delivery fees.
        </p>
      </LegalSection>

      <LegalSection heading="If something is wrong">
        <p>
          We want you to be happy with your order. If something is wrong, message us on
          WhatsApp at {BAKERY.phoneDisplay} and tell us what happened. Photos help.
        </p>
        <p>
          <a
            href={BAKERY.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Message us on WhatsApp
          </a>
        </p>
      </LegalSection>

      <LegalSection heading="Before you order">
        <p>
          Check your items, flavors, delivery area and contact details at checkout before you
          pay. If you have an allergy, tell us before you order.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
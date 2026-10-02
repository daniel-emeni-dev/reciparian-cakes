import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/app/components/LegalPage'
import { BAKERY } from '@/lib/bakery'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${BAKERY.name} collects and uses your information.`,
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="2 Oct 2026">
      <LegalSection heading="What we collect">
        <p>
          When you place an order we collect your name, email, phone number and, for delivery,
          your delivery address. When you send us a message through the contact form we collect
          what you type there, such as your name, email, phone number, event date and message.
          If you create an account we also keep your login details.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          We use your information to prepare and deliver your order, send you order emails,
          reply to your messages and let you track your order.
        </p>
      </LegalSection>

      <LegalSection heading="Payments">
        <p>
          Payments are handled by Paystack. Your card or bank details go to Paystack and are
          never stored on our site.
        </p>
      </LegalSection>

      <LegalSection heading="Who handles your data">
        <p>
          Your order and account information is stored with Supabase. Order and contact emails
          are sent through Resend. We do not sell your information.
        </p>
      </LegalSection>

      <LegalSection heading="Your cart">
        <p>
          Your cart is saved in your own browser on your device so it is still there when you
          come back. You can clear it by logging out or clearing your browser data.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          To ask us to see, correct or delete your information, email {BAKERY.email} or message
          us on WhatsApp at {BAKERY.phoneDisplay}.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
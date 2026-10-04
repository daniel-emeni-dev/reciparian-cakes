import { BAKERY } from '@/lib/bakery'

export const FAQS = [
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

export const HOME_FAQS = FAQS.slice(0, 4)
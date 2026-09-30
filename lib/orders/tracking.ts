import { BAKERY } from '@/lib/bakery'

export type StepState = 'done' | 'current' | 'upcoming'

export interface TrackingStep {
  label: string
  state: StepState
}

export interface TrackingView {
  headline: string
  detail: string
  steps: TrackingStep[]
}

const DELIVERY_STEPS = ['Order confirmed', 'Out for delivery', 'Delivered'] as const
const PICKUP_STEPS = ['Order confirmed', 'Picked up'] as const

const CONTACT_LINE = `If you were charged, message us on WhatsApp at ${BAKERY.phoneDisplay} with your order reference.`

function buildSteps(labels: readonly string[], currentIndex: number): TrackingStep[] {
  return labels.map((label, index) => ({
    label,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }))
}

export function getTrackingView(
  status: string,
  fulfillmentType: 'delivery' | 'pickup'
): TrackingView {
  const isDelivery = fulfillmentType === 'delivery'
  const labels = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS

  switch (status) {
    case 'pending_payment':
      return {
        headline: 'Waiting for payment',
        detail: `We have not confirmed payment yet. Bank transfers can take a few minutes. ${CONTACT_LINE}`,
        steps: [],
      }
    case 'expired':
      return {
        headline: 'This order expired',
        detail: `Payment was not confirmed in time. ${CONTACT_LINE}`,
        steps: [],
      }
    case 'cancelled':
      return {
        headline: 'This order was cancelled',
        detail: CONTACT_LINE,
        steps: [],
      }
    case 'paid':
    case 'awaiting_dispatch':
    case 'ready_for_prep':
      return {
        headline: 'Order confirmed',
        detail: isDelivery
          ? `We are preparing your order. Delivery takes place 24 hours after we start preparing it, between ${BAKERY.deliveryHours}, and we will reach out when the rider is dispatched.`
          : `Your order will be ready 24 hours after you placed it. Collect it from ${BAKERY.pickupAddress}, open ${BAKERY.openingHours}, and show your order reference.`,
        steps: buildSteps(labels, 0),
      }
    case 'out_for_delivery':
      return {
        headline: 'On its way',
        detail: 'Your order is out for delivery.',
        steps: buildSteps(labels, 1),
      }
    case 'completed':
      return {
        headline: isDelivery ? 'Delivered' : 'Picked up',
        detail: `Thank you for ordering from ${BAKERY.name}.`,
        steps: buildSteps(labels, labels.length),
      }
    default:
      return {
        headline: 'We are checking on this order',
        detail: `Please check again shortly, or message us on WhatsApp at ${BAKERY.phoneDisplay}.`,
        steps: [],
      }
  }
}
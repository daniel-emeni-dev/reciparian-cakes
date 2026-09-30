import { z } from 'zod'

export const trackOrderSchema = z.object({
  reference: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._=-]{10,80}$/, 'Please enter the full order reference.'),
  email: z.string().trim().toLowerCase().email('Please enter the email you used at checkout.'),
})

export type TrackOrderInput = z.infer<typeof trackOrderSchema>

export const trackedOrderResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    order: z.object({
      order_reference: z.string(),
      status: z.string(),
      fulfillment_type: z.enum(['delivery', 'pickup']),
      subtotal: z.number(),
      delivery_fee: z.number(),
      total: z.number(),
      created_at: z.string(),
      delivery_address: z.string().nullable(),
      delivery_zones: z.object({ name: z.string() }).nullable(),
    }),
    items: z.array(
      z.object({
        item_name: z.string(),
        quantity: z.number(),
        line_total: z.number(),
      })
    ),
  }),
})

export type TrackedOrderData = z.infer<typeof trackedOrderResponseSchema>['data']
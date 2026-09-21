import { z } from 'zod'

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['out_for_delivery', 'completed', 'cancelled']),
})
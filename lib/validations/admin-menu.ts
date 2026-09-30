import { z } from 'zod'

export const setAvailabilitySchema = z.object({
  menuItemId: z.string().min(1).max(64),
  isAvailable: z.boolean(),
})

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
import { z } from 'zod'

export const setAvailabilitySchema = z.object({
  menuItemId: z.string().min(1).max(64),
  isAvailable: z.boolean(),
})

export const setShowWhenSoldOutSchema = z.object({
  menuItemId: z.string().min(1).max(64),
  showWhenSoldOut: z.boolean(),
})

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
export type SetShowWhenSoldOutInput = z.infer<typeof setShowWhenSoldOutSchema>
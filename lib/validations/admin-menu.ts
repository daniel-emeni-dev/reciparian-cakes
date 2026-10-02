import { z } from 'zod'

export const menuItemIdSchema = z.string().uuid()

export const setAvailabilitySchema = z.object({
  menuItemId: z.string().min(1).max(64),
  isAvailable: z.boolean(),
})

export const setShowWhenSoldOutSchema = z.object({
  menuItemId: z.string().min(1).max(64),
  showWhenSoldOut: z.boolean(),
})

export const menuItemDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter a name.')
    .max(80, 'Keep the name under 80 characters.'),
  description: z.string().trim().max(500, 'Keep the description under 500 characters.'),
  priceNaira: z
    .string()
    .trim()
    .regex(/^\d{1,7}$/, 'Enter the price in naira, numbers only.')
    .refine((value) => Number(value) > 0, 'The price must be more than zero.'),
  minQuantity: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Enter a whole number.')
    .refine((value) => Number(value) >= 1 && Number(value) <= 100, 'Enter a number from 1 to 100.'),
  imageAltText: z
    .string()
    .trim()
    .min(2, 'Please describe the photo.')
    .max(160, 'Keep this under 160 characters.'),
})

export const menuItemUpdateSchema = menuItemDetailsSchema.extend({
  menuItemId: menuItemIdSchema,
})

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
export type SetShowWhenSoldOutInput = z.infer<typeof setShowWhenSoldOutSchema> 
export type MenuItemDetailsInput = z.infer<typeof menuItemDetailsSchema>

export const menuItemImageSchema = z.object({
  menuItemId: menuItemIdSchema,
  imageUrl: z.string().url().max(500),
})

export const uploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  error: z.string().optional(),
})      
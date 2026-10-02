import { z } from 'zod'

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'That name is too long.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\+?[0-9 ]{10,16}$/.test(value), 'Please enter a valid phone number.'),
})

export type ProfileInput = z.infer<typeof profileSchema>
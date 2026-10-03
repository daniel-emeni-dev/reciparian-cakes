import { z } from 'zod'
import { PHONE_MESSAGE, PHONE_PATTERN } from '@/lib/validations/phone'

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'That name is too long.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), PHONE_MESSAGE),
})

export type ProfileInput = z.infer<typeof profileSchema>
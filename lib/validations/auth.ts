import { z } from 'zod'

export const passwordSignupSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const magicLinkSchema = z.object({
  email: z.string().email(),
})

export type PasswordSignupInput = z.infer<typeof passwordSignupSchema>
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>
export type MagicLinkInput = z.infer<typeof magicLinkSchema>

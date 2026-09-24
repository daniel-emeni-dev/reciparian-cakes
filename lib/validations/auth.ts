import { z } from 'zod'

const newPasswordField = z.string().min(8, 'Password must be at least 8 characters')
const confirmPasswordField = z.string().min(1, 'Please confirm your password')

const passwordsMatch = (values: { password: string; confirmPassword: string }) =>
  values.password === values.confirmPassword

const passwordMismatchIssue = {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}

export const passwordSignupSchema = z
  .object({
    fullName: z.string().min(2, 'Name is too short').max(100),
    email: z.string().email(),
    password: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, passwordMismatchIssue)

export const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const magicLinkSchema = z.object({
  email: z.string().email(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, passwordMismatchIssue)

export type PasswordSignupInput = z.infer<typeof passwordSignupSchema>
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>
export type MagicLinkInput = z.infer<typeof magicLinkSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

'use server'

import type { AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import {
  passwordSignupSchema,
  passwordLoginSchema,
  magicLinkSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type PasswordSignupInput,
  type PasswordLoginInput,
  type MagicLinkInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'
import { linkGuestOrdersToUser } from '@/lib/link-guest-orders'

export interface AuthResult {
  success: boolean
  error?: string
  /** true when Supabase requires the user to confirm via email before a session exists */
  needsEmailConfirmation?: boolean
}

// Supabase's built in email sender allows only a few emails per hour, so this
// is the one failure users can realistically hit and need to understand.
function friendlyAuthError(error: AuthError, fallback: string): string {
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'Too many attempts. Please wait a little while and try again.'
  }
  return fallback
}

export async function signUpWithPassword(input: PasswordSignupInput): Promise<AuthResult> {
  const parsed = passwordSignupSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check your details and try again.' }
  }
  const { fullName, email, password } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Sign up failed:', error)
    return {
      success: false,
      error: friendlyAuthError(error, 'Could not create your account. Please try again.'),
    }
  }

  // No session yet means Supabase is waiting on email confirmation.
  // Order linking happens later, once they verify and sign in (see the auth callback route).
  if (!data.session || !data.user) {
    return { success: true, needsEmailConfirmation: true }
  }

  await linkGuestOrdersToUser(data.user.id, email)
  return { success: true }
}

export async function signInWithPassword(input: PasswordLoginInput): Promise<AuthResult> {
  const parsed = passwordLoginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check your details and try again.' }
  }
  const { email, password } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: 'Incorrect email or password.' }
  }

  await linkGuestOrdersToUser(data.user.id, email)
  return { success: true }
}

export async function sendMagicLink(input: MagicLinkInput): Promise<AuthResult> {
  const parsed = magicLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email.' }
  }
  const { email } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      shouldCreateUser: true,
    },
  })

  if (error) {
    console.error('Magic link failed:', error)
    return {
      success: false,
      error: friendlyAuthError(error, 'Could not send the link. Please try again.'),
    }
  }

  // Order linking happens in the callback route once the link is
  // clicked and a real session is established.
  return { success: true, needsEmailConfirmation: true }
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please enter a valid email.' }
  }
  const { email } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  // Supabase returns success for emails with no account, so the caller can
  // show one neutral message without revealing who has an account.
  if (error) {
    console.error('Password reset request failed:', error)
    return {
      success: false,
      error: friendlyAuthError(error, 'Something went wrong. Please try again.'),
    }
  }

  return { success: true }
}

export async function updatePassword(input: ResetPasswordInput): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check your details and try again.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'This reset link has expired. Please request a new one.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    console.error('Password update failed:', error)
    if (error.code === 'same_password') {
      return { success: false, error: 'Please choose a password you are not already using.' }
    }
    return { success: false, error: 'Could not update your password. Please try again.' }
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

'use server'

import { createClient } from '@/lib/supabase/server'
import {
  passwordSignupSchema,
  passwordLoginSchema,
  magicLinkSchema,
  type PasswordSignupInput,
  type PasswordLoginInput,
  type MagicLinkInput,
} from '@/lib/validations/auth'
import { linkGuestOrdersToUser } from '@/lib/link-guest-orders'

export interface AuthResult {
  success: boolean
  error?: string
  /** true when Supabase requires the user to confirm via email before a session exists */
  needsEmailConfirmation?: boolean
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
    return { success: false, error: error.message }
  }

  // No session yet means Supabase is waiting on email confirmation —
  // order linking happens later once they actually verify and sign in
  // (see the auth callback route).
  if (!data.session) {
    return { success: true, needsEmailConfirmation: true }
  }

  await linkGuestOrdersToUser(data.user!.id, email)
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
    return { success: false, error: error.message }
  }

  // Order linking happens in the callback route once the link is
  // clicked and a real session is established.
  return { success: true, needsEmailConfirmation: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

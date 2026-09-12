'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Apple is intentionally left out of this union until the paid
 * Apple Developer account + Sign In with Apple configuration is
 * actually set up in Supabase. Adding 'apple' here before that's
 * done would let the button render but fail at runtime.
 */
type OAuthProvider = 'google'

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    console.error('OAuth sign-in failed:', error)
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}

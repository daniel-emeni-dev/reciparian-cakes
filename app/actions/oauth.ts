'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Apple is intentionally left out of this union until the paid
 * Apple Developer account and Sign In with Apple configuration are
 * actually set up in Supabase. Adding 'apple' here before that's
 * done would let the button render but fail at runtime.
 */
type OAuthProvider = 'google'

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const supabase = await createClient()

  // Behind the Codespaces proxy, the origin and env values can point at
  // localhost, which the browser cannot open. The forwarded host is the
  // address the user is really on. Supabase still rejects any return
  // address that is not on the Redirect URLs allow list.
  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https'
  const siteUrl = forwardedHost
    ? `${protocol}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    console.error('OAuth sign-in failed:', error)
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}
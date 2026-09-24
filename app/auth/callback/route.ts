import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { linkGuestOrdersToUser } from '@/lib/link-guest-orders'

const RESET_PASSWORD_PATH = '/reset-password'

// Only same site paths are allowed. Anything else could be used to send
// someone to another website right after they sign in.
function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }
  return value
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user?.email) {
      await linkGuestOrdersToUser(data.user.id, data.user.email)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const failurePath =
    next === RESET_PASSWORD_PATH
      ? '/forgot-password?error=link_expired'
      : '/login?error=auth_callback_failed'

  return NextResponse.redirect(`${origin}${failurePath}`)
}

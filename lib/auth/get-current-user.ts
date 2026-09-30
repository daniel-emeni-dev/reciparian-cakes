import { createClient } from '@/lib/supabase/server'

export interface CurrentUser {
  id: string
  email: string
  fullName: string | null
}

/**
 * Reads the signed in user for display purposes only (header, greetings).
 * fullName comes from auth user_metadata, set at signup, not from the
 * profiles table, so this stays a single Supabase call.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return null

  const fullName = user.user_metadata?.full_name
  return {
    id: user.id,
    email: user.email,
    fullName: typeof fullName === 'string' && fullName.trim().length > 0 ? fullName : null,
  }
}

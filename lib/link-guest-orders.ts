import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Attaches guest orders to a user's account when the order's
 * customer_email exactly matches the user's own (Supabase-verified)
 * email. Only orders with user_id still null are touched, so a
 * previously-linked order can never be reassigned.
 *
 * Called right after a successful signup or login — never exposed
 * as a public/client-callable action.
 */
export async function linkGuestOrdersToUser(userId: string, verifiedEmail: string): Promise<number> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('orders')
    .update({ user_id: userId })
    .is('user_id', null)
    .eq('customer_email', verifiedEmail)
    .select('id')

  if (error) {
    console.error('Guest order linking failed:', error)
    return 0
  }

  return data?.length ?? 0
}

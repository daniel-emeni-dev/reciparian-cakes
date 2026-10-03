'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export interface WishlistResult {
  success: boolean
  error?: string
}

const menuItemIdSchema = z.string().uuid()
const GENERIC_ERROR = 'Could not update your wishlist. Please try again.'
const UNIQUE_VIOLATION = '23505'

export async function addToWishlist(menuItemId: string): Promise<WishlistResult> {
  const parsed = menuItemIdSchema.safeParse(menuItemId)
  if (!parsed.success) return { success: false, error: GENERIC_ERROR }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Please log in to save favorites.' }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, menu_item_id: parsed.data })

    // Already saved counts as success, so a double tap never shows an error.
    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error('Add to wishlist failed:', error)
      return { success: false, error: GENERIC_ERROR }
    }
    return { success: true }
  } catch (error) {
    console.error('Unexpected add to wishlist error:', error)
    return { success: false, error: GENERIC_ERROR }
  }
}

export async function removeFromWishlist(menuItemId: string): Promise<WishlistResult> {
  const parsed = menuItemIdSchema.safeParse(menuItemId)
  if (!parsed.success) return { success: false, error: GENERIC_ERROR }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Please log in again.' }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('menu_item_id', parsed.data)

    if (error) {
      console.error('Remove from wishlist failed:', error)
      return { success: false, error: GENERIC_ERROR }
    }
    return { success: true }
  } catch (error) {
    console.error('Unexpected remove from wishlist error:', error)
    return { success: false, error: GENERIC_ERROR }
  }
}
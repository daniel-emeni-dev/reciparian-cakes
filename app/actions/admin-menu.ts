'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { setAvailabilitySchema, setShowWhenSoldOutSchema } from '@/lib/validations/admin-menu'

type ActionResult = { success: true } | { success: false; error: string }

const GENERIC_ERROR = 'Could not update the item. Please try again.'

async function updateMenuItem(
  menuItemId: string,
  changes: { is_available: boolean } | { show_when_sold_out: boolean }
): Promise<ActionResult> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('menu_items')
    .update(changes)
    .eq('id', menuItemId)
    .select('id')

  if (error) {
    console.error('Error updating menu item:', error.message)
    return { success: false, error: GENERIC_ERROR }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Item not found.' }
  }

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  return { success: true }
}

export async function setMenuItemAvailability(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = setAvailabilitySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'That update is not valid.' }
  }

  return updateMenuItem(parsed.data.menuItemId, { is_available: parsed.data.isAvailable })
}

export async function setMenuItemShowWhenSoldOut(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = setShowWhenSoldOutSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'That update is not valid.' }
  }

  return updateMenuItem(parsed.data.menuItemId, {
    show_when_sold_out: parsed.data.showWhenSoldOut,
  })
}
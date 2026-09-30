'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { menuItemUpdateSchema } from '@/lib/validations/admin-menu'

type ActionResult = { success: true } | { success: false; error: string }

export async function updateMenuItemDetails(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const parsed = menuItemUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check the form and try again.' }
  }

  const { menuItemId, name, description, priceNaira, minQuantity, imageAltText } = parsed.data

  // Prices are stored in kobo. The form takes whole naira so nobody types extra zeros.
  const { data, error } = await supabase
    .from('menu_items')
    .update({
      name,
      description: description === '' ? null : description,
      price: Number(priceNaira) * 100,
      min_quantity: Number(minQuantity),
      image_alt_text: imageAltText,
    })
    .eq('id', menuItemId)
    .select('id')

  if (error) {
    console.error('Error updating menu item details:', error.message)
    return { success: false, error: 'Could not save the item. Please try again.' }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Item not found.' }
  }

  revalidatePath('/admin/menu')
  revalidatePath(`/admin/menu/${menuItemId}`)
  revalidatePath('/menu')
  return { success: true }
}
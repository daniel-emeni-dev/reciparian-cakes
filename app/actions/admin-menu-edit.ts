'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { MENU_IMAGE_BUCKET } from '@/lib/storage'
import { menuItemImageSchema, menuItemUpdateSchema } from '@/lib/validations/admin-menu'

type ActionResult = { success: true } | { success: false; error: string }

function isOwnStorageUrl(value: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  try {
    const url = new URL(value)
    return (
      url.origin === new URL(supabaseUrl).origin &&
      url.pathname.startsWith(`/storage/v1/object/public/${MENU_IMAGE_BUCKET}/`)
    )
  } catch (error) {
    console.error('Image URL check failed:', error)
    return false
  }
}

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

export async function updateMenuItemImage(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const parsed = menuItemImageSchema.safeParse(input)
  if (!parsed.success || !isOwnStorageUrl(parsed.data.imageUrl)) {
    return { success: false, error: 'That photo is not valid.' }
  }

  const { menuItemId, imageUrl } = parsed.data

  const { data, error } = await supabase
    .from('menu_items')
    .update({ image_url: imageUrl })
    .eq('id', menuItemId)
    .select('id')

  if (error) {
    console.error('Error updating menu item photo:', error.message)
    return { success: false, error: 'Could not save the photo. Please try again.' }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Item not found.' }
  }

  revalidatePath('/admin/menu')
  revalidatePath(`/admin/menu/${menuItemId}`)
  revalidatePath('/menu')
  return { success: true }
}
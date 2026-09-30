import { createClient } from '@/lib/supabase/server'

export async function getMenuData() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menu_items')
    .select(
      `
      *,
      categories (
        name,
        slug
      )
    `
    )
    .or('is_available.eq.true,show_when_sold_out.eq.true')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching menu:', error)
    return []
  }

  // image_alt_text is guaranteed non-null by the schema default, but
  // fall back to the item name defensively in case older rows exist.
    // Sold out items that stay visible go to the end, so the top of the menu is always buyable.
  return data
    .map((item) => ({
      ...item,
      image_alt_text: item.image_alt_text || item.name,
    }))
    .sort((a, b) => Number(!a.is_available) - Number(!b.is_available))
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}
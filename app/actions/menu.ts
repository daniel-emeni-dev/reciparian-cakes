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
    .eq('is_available', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching menu:', error)
    return []
  }

  // image_alt_text is guaranteed non-null by the schema default, but
  // fall back to the item name defensively in case older rows exist.
  return data.map((item) => ({
    ...item,
    image_alt_text: item.image_alt_text || item.name,
  }))
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
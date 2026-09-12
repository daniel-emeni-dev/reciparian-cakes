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

  return data
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

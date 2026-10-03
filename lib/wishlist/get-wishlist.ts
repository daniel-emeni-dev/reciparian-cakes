import { createClient } from '@/lib/supabase/server'
import { isSoldOut } from '@/lib/menu-availability'

export interface WishlistItem {
  menuItemId: string
  name: string
  price: number
  imageUrl: string | null
  imageAltText: string
  minQuantity: number
  soldOut: boolean
}

export async function getWishlistIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('menu_item_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching wishlist ids:', error)
      return []
    }
    return data.map((row) => row.menu_item_id)
  } catch (error) {
    console.error('Unexpected error fetching wishlist ids:', error)
    return []
  }
}

export async function getWishlistItems(userId: string): Promise<WishlistItem[] | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(
        'menu_item_id, created_at, menu_items(id, name, price, image_url, image_alt_text, is_available, stock_count, min_quantity)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wishlist:', error)
      return null
    }

    const items: WishlistItem[] = []
    for (const row of data) {
      const item = row.menu_items
      if (!item) continue
      items.push({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.image_url,
        imageAltText: item.image_alt_text || item.name,
        minQuantity: item.min_quantity,
        soldOut: isSoldOut(item),
      })
    }
    return items
  } catch (error) {
    console.error('Unexpected error fetching wishlist:', error)
    return null
  }
}
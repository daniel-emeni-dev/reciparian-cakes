import { createClient } from '@/lib/supabase/server'

export type CakeFinish = 'buttercream' | 'fondant'

export interface CustomCakePriceRow {
  id: string
  finish: CakeFinish
  size_inches: number
  base_price: number // kobo
}

export interface CustomCakeFlavorRow {
  id: string
  name: string
  is_included: boolean
  upcharge_amount: number | null // kobo, null = "confirm with bakery"
}

export interface CustomCakeAddonRow {
  id: string
  name: string
  description: string | null
  price: number // kobo
}

export async function getCustomCakePricing(): Promise<CustomCakePriceRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_cake_pricing')
    .select('id, finish, size_inches, base_price')
    .order('finish', { ascending: true })
    .order('size_inches', { ascending: true })

  if (error) {
    console.error('Error fetching custom cake pricing:', error)
    return []
  }

  return data
}

export async function getCustomCakeFlavors(): Promise<CustomCakeFlavorRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_cake_flavors')
    .select('id, name, is_included, upcharge_amount')
    .eq('is_available', true)
    .order('is_included', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching custom cake flavors:', error)
    return []
  }

  return data
}

export async function getCustomCakeAddons(): Promise<CustomCakeAddonRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_cake_addons')
    .select('id, name, description, price')
    .eq('is_available', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching custom cake addons:', error)
    return []
  }

  return data
}

// Groups flat pricing rows into { buttercream: [...], fondant: [...] }
export function groupByFinish(rows: CustomCakePriceRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc[row.finish].push(row)
      return acc
    },
    { buttercream: [] as CustomCakePriceRow[], fondant: [] as CustomCakePriceRow[] }
  )
}

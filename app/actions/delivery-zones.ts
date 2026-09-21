import { createClient } from '@/lib/supabase/server'

export interface DeliveryZone {
  id: string
  name: string
  fee: number // kobo
  zone_tier: 'ph_neighborhood' | 'lga'
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('id, name, fee, zone_tier')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching delivery zones:', error)
    return []
  }

  return data
}

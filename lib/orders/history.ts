import { createClient } from '@/lib/supabase/server'
import { trackOrderSchema, type TrackedOrderData } from '@/lib/validations/track'

export interface OrderSummary {
  orderReference: string
  status: string
  fulfillmentType: 'delivery' | 'pickup'
  total: number
  createdAt: string
  itemCount: number
}

const HIDDEN_STATUS = 'expired'
const MAX_ORDERS = 50

// Admins can read every order under RLS, so user_id is filtered explicitly
// to keep "My orders" limited to the signed in person's own purchases.
export async function getMyOrders(userId: string): Promise<OrderSummary[] | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('order_reference, status, fulfillment_type, total, created_at, order_items(quantity)')
      .eq('user_id', userId)
      .neq('status', HIDDEN_STATUS)
      .order('created_at', { ascending: false })
      .limit(MAX_ORDERS)

    if (error) {
      console.error('Error fetching order history:', error)
      return null
    }

    return data.map((row) => ({
      orderReference: row.order_reference,
      status: row.status,
      fulfillmentType: row.fulfillment_type,
      total: row.total,
      createdAt: row.created_at,
      itemCount: row.order_items.reduce((sum, item) => sum + item.quantity, 0),
    }))
  } catch (error) {
    console.error('Unexpected error fetching order history:', error)
    return null
  }
}

export async function getMyOrderByReference(
  userId: string,
  reference: string
): Promise<TrackedOrderData | null> {
  const parsed = trackOrderSchema.shape.reference.safeParse(reference)
  if (!parsed.success) return null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select(
        'order_reference, status, fulfillment_type, subtotal, delivery_fee, total, created_at, delivery_address, delivery_zones(name), order_items(item_name, quantity, line_total, created_at)'
      )
      .eq('order_reference', parsed.data)
      .eq('user_id', userId)
      .order('created_at', { referencedTable: 'order_items', ascending: true })
      .maybeSingle()

    if (error) {
      console.error('Error fetching order detail:', error)
      return null
    }
    if (!data) return null

    return {
      order: {
        order_reference: data.order_reference,
        status: data.status,
        fulfillment_type: data.fulfillment_type,
        subtotal: data.subtotal,
        delivery_fee: data.delivery_fee,
        total: data.total,
        created_at: data.created_at,
        delivery_address: data.delivery_address,
        delivery_zones: data.delivery_zones,
      },
      items: data.order_items.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        line_total: item.line_total,
      })),
    }
  } catch (error) {
    console.error('Unexpected error fetching order detail:', error)
    return null
  }
}
'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getOrderActions } from '@/lib/admin-orders'
import { updateOrderStatusSchema } from '@/lib/validations/admin-order'

type ActionResult = { success: true } | { success: false; error: string }

const GENERIC_ERROR = 'Could not update the order. Please try again.'

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin()

  const parsed = updateOrderStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'That update is not valid.' }
  }

  const { orderId, status } = parsed.data

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, fulfillment_type')
    .eq('id', orderId)
    .maybeSingle()

  if (fetchError) {
    console.error('Error loading order for status update:', fetchError.message)
    return { success: false, error: GENERIC_ERROR }
  }

  if (!order) {
    return { success: false, error: 'Order not found.' }
  }

  const isAllowed = getOrderActions(order.status, order.fulfillment_type).some(
    (action) => action.status === status
  )
  if (!isAllowed) {
    return { success: false, error: 'This order cannot be moved to that status.' }
  }

  // Filtering on the old status stops a second tab or a late webhook from being overwritten.
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('status', order.status)
    .select('id')

  if (updateError) {
    console.error('Error updating order status:', updateError.message)
    return { success: false, error: GENERIC_ERROR }
  }

  if (!updated || updated.length === 0) {
    return { success: false, error: 'This order was just updated. Refresh to see the latest.' }
  }

  revalidatePath('/admin')
  return { success: true }
}
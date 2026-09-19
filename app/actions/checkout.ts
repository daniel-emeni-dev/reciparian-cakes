'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { calculateSubtotal, calculateTotals, type PricedLine } from '@/lib/cart'
import { initializeTransaction, generateOrderReference } from '@/lib/paystack'

export interface CheckoutResult {
  success: boolean
  authorizationUrl?: string
  orderReference?: string
  error?: string
}

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid checkout data.' }
  }
  const data = parsed.data

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error('Checkout: NEXT_PUBLIC_SITE_URL is not set')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin client: guest checkouts have no auth.uid() to satisfy RLS,
  // and we've already validated everything above, so it's safe to
  // write server-side with elevated privileges here.
  const admin = createAdminClient()

  try {
    // --- Re-price every line server-side. Never trust client prices. ---
    const pricedLines: PricedLine[] = []

    for (const item of data.items) {
      if (item.itemType === 'menu_item') {
        const menuItemId = item.menuItemId
        if (!menuItemId) {
          return { success: false, error: 'Missing menu item id.' }
        }

        const { data: menuItem, error } = await admin
          .from('menu_items')
          .select('id, name, price, is_available')
          .eq('id', menuItemId)
          .single()

        if (error || !menuItem || !menuItem.is_available) {
          console.error('Checkout: menu item unavailable', menuItemId, error)
          return {
            success: false,
            error: 'One of the items in your cart is no longer available. Please review your cart.',
          }
        }

        pricedLines.push({
          ...item,
          itemName: menuItem.name,
          unitPrice: menuItem.price,
          lineTotal: menuItem.price * item.quantity,
        })
      } else {
        const config = item.customCakeConfig
        if (!config) {
          return { success: false, error: 'Invalid custom cake configuration.' }
        }

        const { data: pricing, error } = await admin
          .from('custom_cake_pricing')
          .select('base_price')
          .eq('finish', config.finish)
          .eq('size_inches', config.sizeInches)
          .single()

        if (error || !pricing) {
          return { success: false, error: 'Invalid custom cake configuration.' }
        }

        let unitPrice = pricing.base_price

        if (config.flavor) {
          const { data: flavor } = await admin
            .from('custom_cake_flavors')
            .select('upcharge_amount')
            .eq('name', config.flavor)
            .single()
          if (flavor?.upcharge_amount) unitPrice += flavor.upcharge_amount
        }

        if (config.addonIds.length > 0) {
          const { data: addons } = await admin
            .from('custom_cake_addons')
            .select('price')
            .in('id', config.addonIds)
          for (const addon of addons ?? []) unitPrice += addon.price
        }

        pricedLines.push({
          ...item,
          itemName: `Custom ${config.finish} cake (${config.sizeInches}")`,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        })
      }
    }

    const subtotal = calculateSubtotal(pricedLines)

    // --- Delivery fee lookup ---
    let deliveryFee = 0
    const isDelivery = data.fulfillmentType === 'delivery'
    if (isDelivery) {
      const deliveryZoneId = data.deliveryZoneId
      if (!deliveryZoneId) {
        return { success: false, error: 'Delivery zone is required.' }
      }

      const { data: zone, error } = await admin
        .from('delivery_zones')
        .select('fee, is_active')
        .eq('id', deliveryZoneId)
        .single()

      if (error || !zone || !zone.is_active) {
        return { success: false, error: 'Invalid delivery zone.' }
      }
      deliveryFee = zone.fee
    }

    const totals = calculateTotals(subtotal, deliveryFee)
    const orderReference = generateOrderReference()

    // --- Create the pending order ---
    // paystack_reference is written here, not in a later update: if a follow up
    // write failed, the webhook could never find a paid order.
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_reference: orderReference,
        paystack_reference: orderReference,
        user_id: user?.id ?? null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        fulfillment_type: data.fulfillmentType,
        delivery_zone_id: isDelivery ? (data.deliveryZoneId ?? null) : null,
        delivery_address: isDelivery ? (data.deliveryAddress ?? null) : null,
        pickup_notes: data.pickupNotes ?? null,
        subtotal: totals.subtotal,
        delivery_fee: totals.deliveryFee,
        total: totals.total,
        status: 'pending_payment',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      return { success: false, error: 'Could not create order.' }
    }

    const orderItemRows = pricedLines.map((line) => ({
      order_id: order.id,
      item_type: line.itemType,
      menu_item_id: line.itemType === 'menu_item' ? line.menuItemId : null,
      item_name: line.itemName,
      custom_cake_config: line.itemType === 'custom_cake' ? line.customCakeConfig : null,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      line_total: line.lineTotal,
    }))

    const { error: itemsError } = await admin.from('order_items').insert(orderItemRows)
    if (itemsError) {
      console.error('Order items creation failed:', itemsError)
      return { success: false, error: 'Could not save order items.' }
    }

    // --- Initialize Paystack transaction ---
    const paystack = await initializeTransaction({
      email: data.customerEmail,
      amountKobo: totals.total,
      reference: orderReference,
      callbackUrl: `${siteUrl}/checkout/verify`,
      metadata: {
        order_id: order.id,
        order_reference: orderReference,
        fulfillment_type: data.fulfillmentType,
        delivery_address: isDelivery ? (data.deliveryAddress ?? null) : null,
      },
    })

    return {
      success: true,
      authorizationUrl: paystack.data.authorization_url,
      orderReference,
    }
  } catch (err) {
    console.error('Checkout error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

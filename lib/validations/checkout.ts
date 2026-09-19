import { z } from 'zod'

export const cartLineItemSchema = z.object({
  itemType: z.enum(['menu_item', 'custom_cake']),
  menuItemId: z.string().uuid().optional(),
  quantity: z.number().int().positive().max(50),

  // Required only when itemType === 'custom_cake'
  customCakeConfig: z
    .object({
      finish: z.enum(['buttercream', 'fondant']),
      sizeInches: z.number().int().positive(),
      flavor: z.string().min(1),
      addonIds: z.array(z.string().uuid()).max(10).default([]),
      customMessage: z.string().trim().max(120).optional(),
    })
    .optional(),
}).refine(
  (item) =>
    (item.itemType === 'menu_item' && !!item.menuItemId) ||
    (item.itemType === 'custom_cake' && !!item.customCakeConfig),
  { message: 'menuItemId is required for menu_item, customCakeConfig for custom_cake' }
)

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  // Lowercased so guest orders link to accounts by exact email regardless of how it was typed.
  customerEmail: z.string().trim().toLowerCase().email(),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),

  fulfillmentType: z.enum(['delivery', 'pickup']),
  deliveryZoneId: z.string().uuid().optional(),
  deliveryAddress: z.string().trim().min(5).max(300).optional(),
  pickupNotes: z.string().trim().max(300).optional(),

  items: z.array(cartLineItemSchema).min(1),
}).refine(
  (data) =>
    data.fulfillmentType === 'pickup' ||
    (data.fulfillmentType === 'delivery' && !!data.deliveryZoneId && !!data.deliveryAddress),
  { message: 'deliveryZoneId and deliveryAddress are required when fulfillmentType is delivery' }
)

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CartLineItem = z.infer<typeof cartLineItemSchema>

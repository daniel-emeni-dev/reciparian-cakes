import type { Database, Json } from '@/types/database'

export type OrderStatus = Database['public']['Enums']['order_status']

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']

type OrderField =
  | 'id'
  | 'order_reference'
  | 'status'
  | 'fulfillment_type'
  | 'customer_name'
  | 'customer_phone'
  | 'delivery_address'
  | 'pickup_notes'
  | 'subtotal'
  | 'delivery_fee'
  | 'total'
  | 'created_at'
  | 'paid_at'

type OrderItemField = 'id' | 'item_name' | 'quantity' | 'line_total' | 'custom_cake_config'

export type AdminOrderItem = Pick<OrderItemRow, OrderItemField>

export type AdminOrder = Pick<OrderRow, OrderField> & {
  delivery_zones: { name: string } | null
  order_items: AdminOrderItem[]
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  awaiting_dispatch: 'Awaiting dispatch',
  ready_for_prep: 'Ready for prep',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export const ORDER_VIEW_KEYS = ['active', 'completed', 'cancelled'] as const
export type OrderViewKey = (typeof ORDER_VIEW_KEYS)[number]

interface OrderView {
  label: string
  emptyMessage: string
  statuses: OrderStatus[]
  oldestFirst: boolean
}

export const ORDER_VIEWS: Record<OrderViewKey, OrderView> = {
  active: {
    label: 'Active',
    emptyMessage: 'No active orders right now.',
    statuses: ['paid', 'awaiting_dispatch', 'ready_for_prep', 'out_for_delivery'],
    oldestFirst: true,
  },
  completed: {
    label: 'Completed',
    emptyMessage: 'No completed orders yet.',
    statuses: ['completed'],
    oldestFirst: false,
  },
  cancelled: {
    label: 'Cancelled',
    emptyMessage: 'No cancelled orders.',
    statuses: ['cancelled'],
    oldestFirst: false,
  },
}
type MessageOrder = Pick<AdminOrder, 'customer_name' | 'order_reference' | 'status'>

export function buildCustomerMessage(order: MessageOrder): string {
  const firstName = order.customer_name.trim().split(/\s+/)[0] || 'there'
  const opening = `Hi ${firstName}, this is Reciparian Cakes about your order ${order.order_reference}.`

  switch (order.status) {
    case 'awaiting_dispatch':
      return `${opening} We have received your payment and your order will be delivered soon.`
    case 'ready_for_prep':
      return `${opening} We have received your payment and your order is being prepared for pickup.`
    case 'out_for_delivery':
      return `${opening} Your order is on its way to you.`
    default:
      return opening
  }
}

function humanizeKey(key: string): string {
  const spaced = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function formatConfigValue(value: Json | undefined): string {
  if (Array.isArray(value)) return value.map((entry) => formatConfigValue(entry)).join(', ')
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

interface CakeDetail {
  label: string
  value: string
}

type CakeConfig = { [key: string]: Json | undefined }

function asCakeConfig(config: Json | null): CakeConfig | null {
  if (config === null || typeof config !== 'object' || Array.isArray(config)) return null
  return config
}

export function collectAddonIds(orders: AdminOrder[]): string[] {
  const ids = new Set<string>()

  for (const order of orders) {
    for (const item of order.order_items) {
      const addonIds = asCakeConfig(item.custom_cake_config)?.addonIds
      if (!Array.isArray(addonIds)) continue

      for (const id of addonIds) {
        if (typeof id === 'string') ids.add(id)
      }
    }
  }

  return Array.from(ids)
}

export function describeCakeConfig(
  config: Json | null,
  addonNames: Record<string, string>
): CakeDetail[] {
  const values = asCakeConfig(config)
  if (!values) return []

  const details: CakeDetail[] = []
  const shown = new Set<string>()
  const { finish, sizeInches, flavor, addonIds, customMessage } = values

  if (typeof finish === 'string') {
    details.push({ label: 'Finish', value: finish.charAt(0).toUpperCase() + finish.slice(1) })
    shown.add('finish')
  }

  if (typeof sizeInches === 'number') {
    details.push({ label: 'Size', value: `${sizeInches} inch` })
    shown.add('sizeInches')
  }

  if (typeof flavor === 'string' && flavor !== '') {
    details.push({ label: 'Flavor', value: flavor })
    shown.add('flavor')
  }

  if (Array.isArray(addonIds)) {
    shown.add('addonIds')

    if (addonIds.length > 0) {
      const names = addonIds.map(
        (id) => (typeof id === 'string' ? addonNames[id] : undefined) ?? 'Unknown add on'
      )
      details.push({ label: 'Add ons', value: names.join(', ') })
    }
  }

  if (typeof customMessage === 'string' && customMessage !== '') {
    details.push({ label: 'Custom message', value: customMessage })
    shown.add('customMessage')
  }

  for (const [key, value] of Object.entries(values)) {
    if (shown.has(key) || value === undefined || value === null || value === '') continue
    details.push({ label: humanizeKey(key), value: formatConfigValue(value) })
  }

  return details
}

type FulfillmentType = Database['public']['Enums']['fulfillment_type']

export interface OrderAction {
  status: OrderStatus
  label: string
  destructive: boolean
}

export function getOrderActions(status: OrderStatus, fulfillmentType: FulfillmentType): OrderAction[] {
  const cancel: OrderAction = { status: 'cancelled', label: 'Cancel order', destructive: true }
  const complete: OrderAction = {
    status: 'completed',
    label: fulfillmentType === 'delivery' ? 'Mark delivered' : 'Mark collected',
    destructive: false,
  }

  switch (status) {
    case 'awaiting_dispatch':
      return [{ status: 'out_for_delivery', label: 'Out for delivery', destructive: false }, cancel]
    case 'ready_for_prep':
    case 'out_for_delivery':
    case 'paid':
      return [complete, cancel]
    default:
      return []
  }
}
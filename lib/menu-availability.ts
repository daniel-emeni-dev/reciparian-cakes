interface Sellable {
  is_available: boolean
  stock_count: number | null
  min_quantity: number
}

// Stock below the minimum order cannot be sold, so it counts as sold out.
export function isSoldOut(item: Sellable): boolean {
  return !item.is_available || (item.stock_count !== null && item.stock_count < item.min_quantity)
}
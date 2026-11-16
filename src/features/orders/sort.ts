import type { Order } from './types'

export type SortKey = 'created' | 'price'
export type SortDirection = 'asc' | 'desc'
export type Sort = { key: SortKey; direction: SortDirection }

/** Newest first, as the orders come. */
export const DEFAULT_SORT: Sort = { key: 'created', direction: 'desc' }

/** The direction a column starts with when it is clicked for the first time: newest first, cheapest first. */
const FIRST_DIRECTION: Record<SortKey, SortDirection> = { created: 'desc', price: 'asc' }

/** Clicking the column that is sorted turns the order around, clicking another column sorts by it. */
export function nextSort(current: Sort, key: SortKey): Sort {
  if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
  return { key, direction: FIRST_DIRECTION[key] }
}

export function sortOrders(orders: Order[], { key, direction }: Sort): Order[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...orders].sort((a, b) => {
    // Orders made at the same minute (a paid one and a cancelled one) keep a steady order by their number.
    const byKey = key === 'price' ? a.price - b.price : a.createdAt.localeCompare(b.createdAt)
    return sign * (byKey || a.id.localeCompare(b.id))
  })
}

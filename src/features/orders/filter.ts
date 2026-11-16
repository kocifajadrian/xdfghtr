import type { Order } from './types'

/** "all", a number of days ("30d", "90d", "12m" counted as 365) or a calendar year ("2025"). */
export type Period = 'all' | '30d' | '90d' | '12m' | `${number}`

export type OrderFilter = { query: string; period: Period }

export const NO_FILTER: OrderFilter = { query: '', period: 'all' }

export const isFiltering = (f: OrderFilter) => f.query.trim() !== '' || f.period !== 'all'

const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const DAYS = { '30d': 30, '90d': 90, '12m': 365 } as const

/** The years that have an order, newest first, for the period list. */
export function orderYears(orders: Order[]): string[] {
  return [...new Set(orders.map((o) => o.createdAt.slice(0, 4)))].sort().reverse()
}

/**
 * The orders that match both conditions. The search looks in the order number, the product name (`productLabel`,
 * so it matches what the customer reads in their language) and the description.
 */
export function filterOrders(
  orders: Order[],
  filter: OrderFilter,
  productLabel: (order: Order) => string,
  now = new Date(),
): Order[] {
  const words = plain(filter.query).split(/\s+/).filter(Boolean)
  return orders.filter((order) => {
    if (filter.period !== 'all') {
      if (filter.period in DAYS) {
        const limit = now.getTime() - DAYS[filter.period as keyof typeof DAYS] * 86_400_000
        if (new Date(order.createdAt).getTime() < limit) return false
      } else if (!order.createdAt.startsWith(filter.period)) return false
    }

    const text = plain(`${order.id} ${productLabel(order)} ${order.description}`)
    return words.every((word) => text.includes(word))
  })
}

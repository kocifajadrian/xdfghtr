export type OrderProduct =
  'timeTicket' | 'cardCredit' | 'discount' | 'credit' | 'cityTicket' | 'parking' | 'newCard'
export type OrderStatus = 'paid' | 'pending' | 'cancelled' | 'failed' | 'refunded'
export type OrderPayment = 'card' | 'credit' | 'bank'

export type OrderItem = { name: string; qty: number; price: number }

export type Order = {
  /** The order number the customer sees. */
  id: string
  /** Local date and time, "2026-09-23T01:12:00". */
  createdAt: string
  product: OrderProduct
  /** A short text from the shop about what was bought. Not translated, it comes from the server. */
  description: string
  /** What the order consists of. The prices add up to `price`. */
  items: OrderItem[]
  /** In euro. */
  price: number
  payment: OrderPayment
  status: OrderStatus
  /** The transport card the order belongs to, shown shortened. */
  card?: string
}

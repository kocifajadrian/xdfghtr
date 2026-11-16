export type CardKind = 'full' | 'student' | 'senior'
export type CardStatus = 'active' | 'blocked'

/** The time ticket stored on a card. Dates are local days, "2026-12-22". */
export type CardTicket = {
  /** Name from the carrier, e.g. "PCL 90 dní". Not translated, it comes from the server. */
  name: string
  from: string
  to: string
  zones: string[]
}

export type TransportCard = {
  id: string
  /** 16 digits without spaces. */
  number: string
  /** Who the card was issued to. */
  holder: string
  carrier: string
  kind: CardKind
  status: CardStatus
  /** A duplicate was ordered, the old card is blocked. */
  duplicateOrdered: boolean
  /** In euro. */
  credit: number
  /** Local date and time of the credit balance, "2026-11-14T08:30:00". */
  creditAsOf: string
  /** Local day, "2031-07-21". */
  validUntil: string
  discountUntil: string | null
  ticket: CardTicket | null
  greenKm: number
  /** Saved CO2 in kg. */
  co2Kg: number
}

/** A time ticket that can be bought for a card. */
export type TicketOption = { id: string; days: number; price: number }

/** One payment made with the card while travelling (in a bus, a train). */
export type CardTransaction = {
  id: string
  /** Local date and time, "2026-11-14T08:30:00". */
  at: string
  /** Line, e.g. "Bus 33". Not translated, it comes from the carrier. */
  line: string
  /** Where the ride was, e.g. "Žilina, AS - Rajec". */
  route: string
  /** In euro, negative: the money left the credit. */
  amount: number
}

/** How a top-up or a ticket is paid. `credit` is the money already on the card. */
export type PaymentMethod = 'card' | 'savedCard' | 'tatrapay' | 'googlePay' | 'credit'

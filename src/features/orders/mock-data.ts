import type { Order, OrderItem, OrderPayment, OrderProduct, OrderStatus } from './types'

const CARD = '6162 7730 5827 7636'

/** An order `daysAgo` days before today at `time`, so the demo always has recent orders. */
function order(
  id: string,
  daysAgo: number,
  time: string,
  product: OrderProduct,
  description: string,
  items: OrderItem[],
  payment: OrderPayment,
  status: OrderStatus,
  card: string | null = CARD,
): Order {
  const day = new Date()
  day.setDate(day.getDate() - daysAgo)
  const [h, m] = time.split(':').map(Number)
  day.setHours(h, m, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  const createdAt = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${pad(h)}:${pad(m)}:00`
  const price = Math.round(items.reduce((sum, i) => sum + i.qty * i.price, 0) * 100) / 100
  return { id, createdAt, product, description, items, price, payment, status, card: card ?? undefined }
}

const one = (name: string, price: number): OrderItem[] => [{ name, qty: 1, price }]

// Demo orders, newest first.
const HAND_MADE: Order[] = [
  order(
    '14598210',
    1,
    '07:42',
    'cityTicket',
    'Lístok MHD Žilina, 60 minút',
    [{ name: 'Lístok MHD 60 min', qty: 2, price: 1.2 }],
    'card',
    'paid',
  ),
  order(
    '14594377',
    3,
    '17:40',
    'parking',
    'Parkovanie Žilina, zóna A, 3 hodiny',
    one('Parkovanie zóna A, 3 h', 2.4),
    'card',
    'paid',
    null,
  ),
  order(
    '14571002',
    8,
    '12:05',
    'timeTicket',
    'Časový lístok 30 dní, Žilinský kraj',
    one('Časový lístok 30 dní', 40),
    'bank',
    'pending',
  ),
  order(
    '14540816',
    15,
    '06:31',
    'credit',
    'Nabitie kreditu na dopravnú kartu',
    one('Kredit 10 €', 10),
    'card',
    'paid',
  ),
  order(
    '14512093',
    22,
    '19:22',
    'parking',
    'Parkovanie Martin, centrum, 2 hodiny',
    one('Parkovanie centrum, 2 h', 1.6),
    'card',
    'cancelled',
    null,
  ),
  order(
    '14488440',
    29,
    '08:15',
    'cityTicket',
    'Električenka Žilina – Martin, jednosmerná',
    one('Električenka Žilina – Martin', 1.9),
    'credit',
    'paid',
  ),
  order(
    '14409058',
    54,
    '01:12',
    'timeTicket',
    'Časový lístok 90 dní, všetky zóny',
    one('Časový lístok 90 dní', 108),
    'card',
    'paid',
  ),
  order(
    '14377215',
    61,
    '14:03',
    'timeTicket',
    'Týždenný lístok, Žilina MHD',
    one('Týždenný lístok MHD', 8.5),
    'card',
    'refunded',
  ),
  order(
    '14320984',
    75,
    '10:48',
    'cityTicket',
    'Lístok MHD Košice, 30 minút',
    [{ name: 'Lístok MHD 30 min', qty: 3, price: 0.8 }],
    'card',
    'paid',
    null,
  ),
  order(
    '13816158',
    91,
    '05:50',
    'timeTicket',
    'Časový lístok 30 dní, Žilinský kraj',
    one('Časový lístok 30 dní', 40),
    'card',
    'paid',
  ),
  order(
    '13790433',
    99,
    '18:09',
    'credit',
    'Nabitie kreditu na dopravnú kartu',
    one('Kredit 20 €', 20),
    'bank',
    'paid',
  ),
  order(
    '13701128',
    118,
    '09:27',
    'parking',
    'Parkovanie Trenčín, zóna B, 4 hodiny',
    one('Parkovanie zóna B, 4 h', 3.2),
    'card',
    'paid',
    null,
  ),
  order(
    '13594668',
    123,
    '12:18',
    'timeTicket',
    'Časový lístok 30 dní, Žilinský kraj',
    one('Časový lístok 30 dní', 40),
    'card',
    'paid',
  ),
  order(
    '13581060',
    124,
    '06:02',
    'cardCredit',
    'Nová čipová karta a nabitie kreditu 12 €',
    [
      { name: 'Čipová karta', qty: 1, price: 6 },
      { name: 'Kredit 12 €', qty: 1, price: 12 },
    ],
    'card',
    'paid',
  ),
  order(
    '13244871',
    170,
    '16:35',
    'newCard',
    'Nová čipová karta, doručenie poštou',
    [
      { name: 'Čipová karta', qty: 1, price: 6 },
      { name: 'Poštovné', qty: 1, price: 3.5 },
    ],
    'card',
    'cancelled',
    null,
  ),
  order(
    '12980566',
    215,
    '11:11',
    'cityTicket',
    'Lístok MHD Žilina, 60 minút',
    [{ name: 'Lístok MHD 60 min', qty: 1, price: 1.2 }],
    'credit',
    'paid',
  ),
  order(
    '12744309',
    262,
    '07:56',
    'timeTicket',
    'Časový lístok 30 dní, Žilinský kraj',
    one('Časový lístok 30 dní', 38),
    'card',
    'paid',
  ),
  order(
    '12311702',
    330,
    '13:44',
    'parking',
    'Parkovanie Bratislava, centrum, 2 hodiny',
    one('Parkovanie centrum, 2 h', 4),
    'card',
    'paid',
    null,
  ),
  order(
    '10094094',
    420,
    '11:45',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.69),
    'card',
    'paid',
  ),
  order(
    '10094092',
    420,
    '11:45',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.69),
    'card',
    'cancelled',
  ),
  order(
    '9120437',
    505,
    '15:20',
    'credit',
    'Nabitie kreditu na dopravnú kartu',
    one('Kredit 15 €', 15),
    'card',
    'paid',
  ),
  order(
    '6556425',
    780,
    '14:21',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.6),
    'card',
    'paid',
  ),
  order(
    '6556422',
    780,
    '14:21',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.6),
    'card',
    'cancelled',
  ),
  order(
    '5871290',
    905,
    '08:02',
    'timeTicket',
    'Časový lístok 30 dní, Žilinský kraj',
    one('Časový lístok 30 dní', 36),
    'card',
    'refunded',
  ),
  order(
    '3853695',
    1150,
    '11:21',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.6),
    'card',
    'paid',
  ),
  order(
    '3307566',
    1250,
    '13:00',
    'credit',
    'Nabitie kreditu na dopravnú kartu',
    one('Kredit 5 €', 5),
    'card',
    'paid',
  ),
  order(
    '1932017',
    1520,
    '10:47',
    'discount',
    'Predĺženie študentskej zľavy v doprave',
    one('Zľava v doprave, 1 rok', 3.6),
    'card',
    'paid',
  ),
]

// --- More orders, made up by a small random generator (always the same ones: the seed is fixed). About half were paid,
// the rest were cancelled, failed at the bank, are still waiting or were refunded.

/** A small seeded random number generator, so the demo shows the same orders on every start. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Template = { product: OrderProduct; description: string; items: OrderItem[] }

const CITIES = ['Žilina', 'Martin', 'Trenčín', 'Bratislava', 'Košice', 'Prešov', 'Nitra', 'Banská Bystrica']
const ZONES = ['zóna A', 'zóna B', 'centrum', 'zóna C']

function template(pick: () => number): Template {
  const from = <T>(list: T[]): T => list[Math.floor(pick() * list.length)]
  const kind = pick()
  if (kind < 0.28) {
    const hours = 1 + Math.floor(pick() * 4)
    const word = hours === 1 ? 'hodina' : hours < 5 ? 'hodiny' : 'hodín'
    return {
      product: 'parking',
      description: `Parkovanie ${from(CITIES)}, ${from(ZONES)}, ${hours} ${word}`,
      items: [{ name: `Parkovanie, ${hours} h`, qty: 1, price: Math.round(hours * 1.2 * 100) / 100 }],
    }
  }
  if (kind < 0.5) {
    const ticket = from([
      { description: 'Lístok MHD Žilina, 60 minút', name: 'Lístok MHD 60 min', price: 1.2 },
      { description: 'Lístok MHD Košice, 30 minút', name: 'Lístok MHD 30 min', price: 0.8 },
      {
        description: 'Električenka Žilina – Martin, jednosmerná',
        name: 'Električenka Žilina – Martin',
        price: 1.9,
      },
      { description: 'Lístok MHD Bratislava, 90 minút', name: 'Lístok MHD 90 min', price: 1.5 },
    ])
    return {
      product: 'cityTicket',
      description: ticket.description,
      items: [{ name: ticket.name, qty: 1 + Math.floor(pick() * 3), price: ticket.price }],
    }
  }
  if (kind < 0.72) {
    const ticket = from([
      { description: 'Časový lístok 30 dní, Žilinský kraj', name: 'Časový lístok 30 dní', price: 40 },
      { description: 'Časový lístok 30 dní, Bratislavský kraj', name: 'Časový lístok 30 dní', price: 38 },
      { description: 'Časový lístok 90 dní, všetky zóny', name: 'Časový lístok 90 dní', price: 108 },
      { description: 'Týždenný lístok, Žilina MHD', name: 'Týždenný lístok MHD', price: 8.5 },
    ])
    return {
      product: 'timeTicket',
      description: ticket.description,
      items: [{ name: ticket.name, qty: 1, price: ticket.price }],
    }
  }
  if (kind < 0.93) {
    const amount = from([5, 10, 15, 20, 30])
    return {
      product: 'credit',
      description: 'Nabitie kreditu na dopravnú kartu',
      items: [{ name: `Kredit ${amount} €`, qty: 1, price: amount }],
    }
  }
  if (kind < 0.97) {
    return {
      product: 'newCard',
      description: 'Nová čipová karta, doručenie poštou',
      items: [
        { name: 'Čipová karta', qty: 1, price: 6 },
        { name: 'Poštovné', qty: 1, price: 3.5 },
      ],
    }
  }
  return {
    product: 'discount',
    description: 'Predĺženie študentskej zľavy v doprave',
    items: [{ name: 'Zľava v doprave, 1 rok', qty: 1, price: 3.6 }],
  }
}

function generate(count: number, taken: Set<string>): Order[] {
  const pick = random(2026)
  const orders: Order[] = []
  for (let i = 0; i < count; i++) {
    // Spread over about three years, a little more of them lately.
    const daysAgo = Math.floor(Math.pow(pick(), 1.6) * 1100)
    const hour = String(6 + Math.floor(pick() * 16)).padStart(2, '0')
    const minute = String(Math.floor(pick() * 60)).padStart(2, '0')
    let id = 2_000_000 + Math.floor((1100 - daysAgo) * 11_000) + Math.floor(pick() * 9_000)
    while (taken.has(String(id))) id++
    taken.add(String(id))

    const { product, description, items } = template(pick)
    const r = pick()
    const status: OrderStatus =
      r < 0.46 ? 'paid' : r < 0.68 ? 'cancelled' : r < 0.9 ? 'failed' : r < 0.95 ? 'refunded' : 'pending'
    // Only recent orders can still be waiting: an old one that never got paid would have been cancelled.
    const finalStatus: OrderStatus = status === 'pending' && daysAgo > 10 ? 'cancelled' : status
    const pay = pick()
    const payment: OrderPayment = pay < 0.7 ? 'card' : pay < 0.88 ? 'credit' : 'bank'
    const card = product === 'parking' ? null : CARD
    orders.push(
      order(
        String(id),
        daysAgo,
        `${hour}:${minute}`,
        product,
        description,
        items,
        payment,
        finalStatus,
        card,
      ),
    )
  }
  return orders
}

export const MOCK_ORDERS: Order[] = [...HAND_MADE, ...generate(73, new Set(HAND_MADE.map((o) => o.id)))].sort(
  (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
)

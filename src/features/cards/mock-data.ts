import type { CardTransaction, TicketOption, TransportCard } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Local day `offset` days from today, "2026-12-22", so the demo tickets are always valid. */
export function dayFromToday(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local date and time right now, "2026-11-14T08:30:00". */
export function nowLocal(): string {
  const d = new Date()
  return `${dayFromToday(0)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

export const TICKET_OPTIONS: TicketOption[] = [
  { id: '30', days: 30, price: 24 },
  { id: '90', days: 90, price: 62 },
  { id: '365', days: 365, price: 210 },
]

/** Price of a new plastic card, in euro. */
export const NEW_CARD_PRICE = 5

/** A card number that starts with this is "not found" in the mock, to show the error. */
export const UNKNOWN_PREFIX = '0000'

export function initialCards(): TransportCard[] {
  return [
    {
      id: 'c1',
      holder: 'Adrián Kocifaj',
      number: '6162773058277636',
      carrier: 'SAD Žilina',
      kind: 'full',
      status: 'active',
      duplicateOrdered: false,
      credit: 4.92,
      creditAsOf: nowLocal(),
      validUntil: '2031-07-21',
      discountUntil: '2031-07-21',
      ticket: {
        name: 'PCL 90 dní',
        from: dayFromToday(-54),
        to: dayFromToday(35),
        zones: ['IDS PLUS', '99', '202', '205', '206'],
      },
      greenKm: 28,
      co2Kg: 6.37,
    },
    {
      id: 'c2',
      holder: 'Adrián Kocifaj',
      number: '6162773011442208',
      carrier: 'DPB Bratislava',
      kind: 'full',
      status: 'active',
      duplicateOrdered: false,
      credit: 18.5,
      creditAsOf: nowLocal(),
      validUntil: '2029-09-01',
      discountUntil: null,
      ticket: null,
      greenKm: 112,
      co2Kg: 25.4,
    },
    {
      id: 'c3',
      holder: 'Adrián Kocifaj',
      number: '6162773099013345',
      carrier: 'DPMK Košice',
      kind: 'full',
      status: 'blocked',
      duplicateOrdered: true,
      credit: 0.4,
      creditAsOf: nowLocal(),
      validUntil: '2028-02-10',
      discountUntil: null,
      ticket: null,
      greenKm: 6,
      co2Kg: 1.2,
    },
    {
      id: 'c4',
      holder: 'Fero Mrkva',
      number: '6162773044120917',
      carrier: 'DPMK Košice',
      kind: 'full',
      status: 'active',
      duplicateOrdered: false,
      credit: 12.3,
      creditAsOf: nowLocal(),
      validUntil: '2030-03-15',
      discountUntil: null,
      ticket: { name: 'PCL 30 dní', from: dayFromToday(-9), to: dayFromToday(20), zones: ['KE 1', 'KE 2'] },
      greenKm: 64,
      co2Kg: 14.1,
    },
    {
      id: 'c5',
      holder: 'Adam Petržlen',
      number: '6162773078650321',
      carrier: 'SAD Žilina',
      kind: 'student',
      status: 'active',
      duplicateOrdered: false,
      credit: 7.8,
      creditAsOf: nowLocal(),
      validUntil: '2029-09-01',
      discountUntil: '2027-06-30',
      ticket: null,
      greenKm: 203,
      co2Kg: 45.9,
    },
  ]
}

const at = (daysAgo: number, time: string) => {
  const [h, m] = time.split(':')
  return `${dayFromToday(-daysAgo)}T${h.padStart(2, '0')}:${m}:00`
}

/** Rides paid with a card, newest first. Only a few cards have any in the demo. */
export function initialTransactions(): Record<string, CardTransaction[]> {
  const ride = (id: string, daysAgo: number, time: string, line: string, route: string, amount: number) => ({
    id,
    at: at(daysAgo, time),
    line,
    route,
    amount: -amount,
  })
  return {
    c1: [
      ride('t1', 0, '07:12', 'Bus 33', 'Žilina, AS - Žilina, Hurbanova', 0.9),
      ride('t2', 1, '17:41', 'Bus 12', 'Žilina, Hurbanova - Žilina, AS', 0.9),
      ride('t3', 1, '07:15', 'Bus 33', 'Žilina, AS - Žilina, Hurbanova', 0.9),
      ride('t4', 3, '18:05', 'Bus 505', 'Rajec - Žilina, AS', 2.4),
      ride('t5', 3, '06:50', 'Bus 505', 'Žilina, AS - Rajec', 2.4),
      ride('t6', 6, '12:30', 'Bus 24', 'Žilina, Solinky - Žilina, AS', 0.9),
      ride('t7', 9, '16:20', 'Bus 33', 'Žilina, Hurbanova - Žilina, AS', 0.9),
      ride('t8', 12, '08:02', 'Bus 505', 'Žilina, AS - Rajec', 2.4),
    ],
    c2: [
      ride('t9', 2, '09:10', 'Bus 50', 'Bratislava, AS - Bratislava, Ružinov', 1.2),
      ride('t10', 5, '19:45', 'Električka 4', 'Bratislava, Hlavná stanica - Dúbravka', 1.2),
    ],
    c4: [
      ride('t11', 0, '06:40', 'Bus 71', 'Košice, AS - Košice, Terasa', 0.7),
      ride('t12', 2, '15:55', 'Bus 71', 'Košice, Terasa - Košice, AS', 0.7),
    ],
    c5: [ride('t13', 1, '13:20', 'Bus 90', 'Žilina, AS - Žilina, Hájik', 0.45)],
  }
}

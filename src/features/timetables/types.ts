export type Mode = 'train' | 'bus' | 'mhd'

/** What the visitor wants to travel with: some modes everywhere, or only the city transit of one town. */
export type TransportFilter = { modes: Mode[]; city: string | null }

export const ALL_MODES: Mode[] = ['bus', 'train', 'mhd']

export type Stop = {
  name: string
  /** Departure time, "HH:MM". */
  time: string
  /** Position on the map. */
  lng: number
  lat: number
}

export type TransitLeg = {
  kind: 'transit'
  mode: Mode
  /** Line label, e.g. "Autobus 111" or "S2". */
  line: string
  operator: string
  delayMin: number
  /** EUR. */
  price: number
  zones: string
  stops: Stop[]
}

export type WalkLeg = {
  kind: 'walk'
  minutes: number
  stops: [Stop, Stop]
}

export type Leg = TransitLeg | WalkLeg

export type Connection = {
  id: string
  /** Minutes from now until the departure. */
  inMin: number
  legs: Leg[]
}

export type SearchQuery = {
  from: string
  to: string
  /** "now" or a "YYYY-MM-DDTHH:MM" local date and time. */
  when: string
  directOnly: boolean
  filter: TransportFilter
}

/** A search with nothing filled in yet. */
export const EMPTY_QUERY: SearchQuery = {
  from: '',
  to: '',
  when: 'now',
  directOnly: false,
  filter: { modes: ALL_MODES, city: null },
}

// The journeys the demo can search. Each one is defined in a single direction; the other direction is made by turning
// it around (reverseConnection). Any pair of stops that is not here finds nothing. Replaced by the real API in api.ts.
import { reverseConnection, shift, ZBOROV_TO_ZILINA } from './mock-data'
import { formatTime, toMinutes } from './time'
import type { Connection, Leg, Mode, Stop, TransitLeg } from './types'

/** [name, lng, lat, minutes after the start of the leg]. */
type Point = [string, number, number, number]

function leg(
  mode: Mode,
  line: string,
  operator: string,
  price: number,
  start: string,
  points: Point[],
  delayMin = 0,
): TransitLeg {
  const stops: Stop[] = points.map(([name, lng, lat, after]) => ({
    name,
    lng,
    lat,
    time: formatTime(toMinutes(start) + after),
  }))
  return { kind: 'transit', mode, line, operator, delayMin, price, zones: '', stops }
}

export type Journey = { from: string; to: string; connections: Connection[] }

/** Bratislava to Trnava: a fast train and a bus. */
function bratislavaTrnava(): Connection[] {
  const train = leg('train', 'R 603', 'ZSSK', 3.6, '06:10', [
    ['Bratislava hl. st.', 17.1066, 48.1578, 0],
    ['Bratislava-Rača', 17.1927, 48.2077, 12],
    ['Pezinok', 17.268, 48.2889, 22],
    ['Šenkvice', 17.383, 48.303, 30],
    ['Trnava', 17.5877, 48.3701, 43],
  ])
  const bus = leg(
    'bus',
    'Autobus 600',
    'SAD Trnava',
    3.1,
    '06:25',
    [
      ['Bratislava, Mlynské nivy', 17.1247, 48.1445, 0],
      ['Šenkvice, rázc.', 17.36, 48.32, 32],
      ['Voderady, obec', 17.47, 48.35, 42],
      ['Trnava, aut. st.', 17.5883, 48.3735, 55],
    ],
    3,
  )
  return [
    { id: 'bt1', inMin: 11, legs: [train] },
    { id: 'bt2', inMin: 26, legs: [bus] },
    { id: 'bt3', inMin: 71, legs: [shift(train, 60)] },
  ]
}

/** Bratislava to Košice: an express train, a long-distance bus and a later train. */
function bratislavaKosice(): Connection[] {
  const train = leg(
    'train',
    'EC 275',
    'ZSSK',
    24.9,
    '06:40',
    [
      ['Bratislava hl. st.', 17.1066, 48.1578, 0],
      ['Trnava', 17.5877, 48.3701, 35],
      ['Trenčín', 18.0425, 48.8885, 80],
      ['Žilina', 18.7449, 49.224, 125],
      ['Poprad-Tatry', 20.3034, 49.0638, 215],
      ['Košice', 21.2655, 48.7265, 280],
    ],
    17,
  )
  const bus = leg('bus', 'Autobus 700', 'RegioJet', 14.9, '07:05', [
    ['Bratislava, Mlynské nivy', 17.1247, 48.1445, 0],
    ['Trnava, aut. st.', 17.5883, 48.3735, 40],
    ['Trenčín, aut. st.', 18.0393, 48.8934, 90],
    ['Žilina, AS', 18.7469, 49.2231, 150],
    ['Poprad, AS', 20.2987, 49.0583, 245],
    ['Košice, aut. st.', 21.2637, 48.7213, 335],
  ])
  return [
    { id: 'bk1', inMin: 14, legs: [train] },
    { id: 'bk2', inMin: 39, legs: [bus] },
    { id: 'bk3', inMin: 134, legs: [shift(train, 120)] },
  ]
}

/** Žilina to Martin: a quick regional train and a bus. */
function zilinaMartin(): Connection[] {
  const train = leg('train', 'Os 1812', 'ZSSK', 1.5, '06:12', [
    ['Žilina, žel. st.', 18.7449, 49.224, 0],
    ['Varín', 18.866, 49.198, 8],
    ['Vrútky', 18.922, 49.113, 18],
    ['Martin', 18.921, 49.07, 25],
  ])
  const bus = leg('bus', 'Autobus 421', 'SAD Žilina', 1.9, '06:30', [
    ['Žilina, AS', 18.7469, 49.2231, 0],
    ['Varín, obec', 18.87, 49.199, 12],
    ['Vrútky, aut. st.', 18.92, 49.115, 27],
    ['Martin, aut. st.', 18.919, 49.065, 40],
  ])
  return [
    { id: 'zm1', inMin: 7, legs: [train] },
    { id: 'zm2', inMin: 25, legs: [bus] },
    { id: 'zm3', inMin: 67, legs: [shift(train, 60)] },
  ]
}

/** Banská Bystrica to Zvolen: a train and a bus. */
function bystricaZvolen(): Connection[] {
  const train = leg('train', 'Os 8120', 'ZSSK', 1.2, '06:20', [
    ['Banská Bystrica, žel. st.', 19.1457, 48.7435, 0],
    ['Radvaň', 19.136, 48.701, 7],
    ['Kremnička', 19.138, 48.658, 13],
    ['Zvolen, žel. st.', 19.1345, 48.5754, 22],
  ])
  const bus = leg('bus', 'Autobus 540', 'SAD Zvolen', 1.5, '06:40', [
    ['Banská Bystrica, aut. st.', 19.145, 48.738, 0],
    ['Radvaň, Jednota', 19.133, 48.704, 9],
    ['Sliač, obec', 19.151, 48.614, 22],
    ['Zvolen, aut. st.', 19.131, 48.578, 35],
  ])
  return [
    { id: 'bz1', inMin: 8, legs: [train] },
    { id: 'bz2', inMin: 28, legs: [bus] },
    { id: 'bz3', inMin: 68, legs: [shift(train, 60)] },
  ]
}

/** Poprad to Prešov: a bus, and a train with a change in Kysak. */
function popradPresov(): Connection[] {
  const bus = leg('bus', 'Autobus 510', 'SAD Prešov', 4.6, '06:15', [
    ['Poprad, AS', 20.2987, 49.0583, 0],
    ['Levoča, aut. st.', 20.59, 49.026, 30],
    ['Sabinov, nám.', 21.097, 49.102, 62],
    ['Prešov, aut. st.', 21.2461, 48.9987, 85],
  ])
  const first = leg('train', 'R 952', 'ZSSK', 4.1, '06:30', [
    ['Poprad-Tatry', 20.3034, 49.0638, 0],
    ['Spišská Nová Ves', 20.56, 48.944, 25],
    ['Margecany', 20.942, 48.892, 60],
    ['Kysak', 21.23, 48.87, 85],
  ])
  const second = leg('train', 'Os 3722', 'ZSSK', 1.1, '08:05', [
    ['Kysak', 21.23, 48.87, 0],
    ['Prešov, žel. st.', 21.238, 48.999, 12],
  ])
  return [
    { id: 'pp1', inMin: 10, legs: [bus] },
    { id: 'pp2', inMin: 25, legs: [first, second] },
    { id: 'pp3', inMin: 70, legs: [shift(bus, 60)] },
  ]
}

/** Pads a journey with two more departures, so a first search always shows at least five connections. */
function withFive(connections: Connection[]): Connection[] {
  const [first, second] = connections
  return [...connections, shiftConnection(second, 75, 'x'), shiftConnection(first, 150, 'y')]
}

/** The journeys, each in one direction. The stop names are the towns; a stop in a town counts as the town. */
export const JOURNEYS: Journey[] = [
  { from: 'Zborov nad Bystricou', to: 'Žilina', connections: withFive(ZBOROV_TO_ZILINA) },
  { from: 'Bratislava', to: 'Trnava', connections: withFive(bratislavaTrnava()) },
  { from: 'Bratislava', to: 'Košice', connections: withFive(bratislavaKosice()) },
  { from: 'Žilina', to: 'Martin', connections: withFive(zilinaMartin()) },
  { from: 'Banská Bystrica', to: 'Zvolen', connections: withFive(bystricaZvolen()) },
  { from: 'Poprad', to: 'Prešov', connections: withFive(popradPresov()) },
]

/** Connections for a pair of towns, in either direction. Empty when the demo does not know the pair. */
export function findConnections(
  from: string,
  to: string,
  same: (a: string, b: string) => boolean,
): Connection[] {
  for (const journey of JOURNEYS) {
    if (same(journey.from, from) && same(journey.to, to)) return journey.connections.map(withDemoDelays)
    if (same(journey.from, to) && same(journey.to, from))
      return journey.connections.map(reverseConnection).map(withDemoDelays)
  }
  return []
}

/** A delay that looks random but is the same every time for the same seed: half the legs are on time, the rest 1 to 25 min late. */
function delayFor(seed: string): number {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0
  h ^= h >>> 16
  return h % 2 === 0 ? 0 : 1 + ((h >>> 1) % 25)
}

/** Gives every transit leg its own demo delay (the data above would otherwise show the same 17 minutes everywhere). */
function withDemoDelays(connection: Connection): Connection {
  return {
    ...connection,
    legs: connection.legs.map((l) =>
      l.kind === 'transit' ? { ...l, delayMin: delayFor(`${connection.id}|${l.line}`) } : l,
    ),
  }
}

/** The same connection `minutes` later (or earlier when negative), for the "load later" and "load earlier" buttons. */

export function shiftConnection(connection: Connection, minutes: number, suffix: string): Connection {
  return {
    ...connection,
    id: `${connection.id}~${suffix}`,
    inMin: connection.inMin + minutes,
    legs: connection.legs.map(
      (l) =>
        ({
          ...shift(l, minutes),
          ...(l.kind === 'transit' ? { delayMin: delayFor(`${suffix}|${connection.id}|${l.line}`) } : {}),
        }) as Leg,
    ),
  }
}

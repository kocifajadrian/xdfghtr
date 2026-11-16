// Demo data for the journey planner. Replaced by the real API in api.ts.
import { formatTime, toMinutes } from './time'
import type { Connection, Leg, Stop, TransitLeg } from './types'

// The demo has connections for a handful of journeys only (see demo-journeys.ts). Any other pair of stops finds nothing.

export type PlaceKind = 'city' | 'village' | 'borough' | 'bus' | 'train' | 'mhd'
export type Place = { name: string; kind: PlaceKind; district: string }

/** Towns, villages and a few stops to start from. The rest of the sample is generated below. */
const BASE_PLACES: Place[] = [
  { name: 'Žilina', kind: 'city', district: 'Žilina' },
  { name: 'Zborov nad Bystricou', kind: 'village', district: 'Čadca' },
  { name: 'Banská Bystrica', kind: 'city', district: 'Banská Bystrica' },
  { name: 'Banská Štiavnica', kind: 'city', district: 'Banská Štiavnica' },
  { name: 'Bardejov', kind: 'city', district: 'Bardejov' },
  { name: 'Bojnice', kind: 'city', district: 'Prievidza' },
  { name: 'Bratislava', kind: 'city', district: 'Bratislava' },
  { name: 'Brezno', kind: 'city', district: 'Brezno' },
  { name: 'Bytča', kind: 'city', district: 'Bytča' },
  { name: 'Čadca', kind: 'city', district: 'Čadca' },
  { name: 'Čierna nad Tisou', kind: 'city', district: 'Trebišov' },
  { name: 'Detva', kind: 'city', district: 'Detva' },
  { name: 'Dolný Kubín', kind: 'city', district: 'Dolný Kubín' },
  { name: 'Dunajská Streda', kind: 'city', district: 'Dunajská Streda' },
  { name: 'Galanta', kind: 'city', district: 'Galanta' },
  { name: 'Gelnica', kind: 'city', district: 'Gelnica' },
  { name: 'Hlohovec', kind: 'city', district: 'Hlohovec' },
  { name: 'Humenné', kind: 'city', district: 'Humenné' },
  { name: 'Hurbanovo', kind: 'city', district: 'Komárno' },
  { name: 'Kežmarok', kind: 'city', district: 'Kežmarok' },
  { name: 'Komárno', kind: 'city', district: 'Komárno' },
  { name: 'Košice', kind: 'city', district: 'Košice' },
  { name: 'Krásno nad Kysucou', kind: 'city', district: 'Čadca' },
  { name: 'Kremnica', kind: 'city', district: 'Žiar nad Hronom' },
  { name: 'Krupina', kind: 'city', district: 'Krupina' },
  { name: 'Kysucké Nové Mesto', kind: 'city', district: 'Kysucké Nové Mesto' },
  { name: 'Levice', kind: 'city', district: 'Levice' },
  { name: 'Levoča', kind: 'city', district: 'Levoča' },
  { name: 'Lipany', kind: 'city', district: 'Sabinov' },
  { name: 'Liptovský Mikuláš', kind: 'city', district: 'Liptovský Mikuláš' },
  { name: 'Lučenec', kind: 'city', district: 'Lučenec' },
  { name: 'Malacky', kind: 'city', district: 'Malacky' },
  { name: 'Martin', kind: 'city', district: 'Martin' },
  { name: 'Medzilaborce', kind: 'city', district: 'Medzilaborce' },
  { name: 'Michalovce', kind: 'city', district: 'Michalovce' },
  { name: 'Modra', kind: 'city', district: 'Pezinok' },
  { name: 'Myjava', kind: 'city', district: 'Myjava' },
  { name: 'Námestovo', kind: 'city', district: 'Námestovo' },
  { name: 'Nitra', kind: 'city', district: 'Nitra' },
  { name: 'Nové Mesto nad Váhom', kind: 'city', district: 'Nové Mesto nad Váhom' },
  { name: 'Nové Zámky', kind: 'city', district: 'Nové Zámky' },
  { name: 'Partizánske', kind: 'city', district: 'Partizánske' },
  { name: 'Pezinok', kind: 'city', district: 'Pezinok' },
  { name: 'Piešťany', kind: 'city', district: 'Piešťany' },
  { name: 'Poprad', kind: 'city', district: 'Poprad' },
  { name: 'Považská Bystrica', kind: 'city', district: 'Považská Bystrica' },
  { name: 'Prešov', kind: 'city', district: 'Prešov' },
  { name: 'Prievidza', kind: 'city', district: 'Prievidza' },
  { name: 'Púchov', kind: 'city', district: 'Púchov' },
  { name: 'Revúca', kind: 'city', district: 'Revúca' },
  { name: 'Rimavská Sobota', kind: 'city', district: 'Rimavská Sobota' },
  { name: 'Rožňava', kind: 'city', district: 'Rožňava' },
  { name: 'Ružomberok', kind: 'city', district: 'Ružomberok' },
  { name: 'Sabinov', kind: 'city', district: 'Sabinov' },
  { name: 'Šahy', kind: 'city', district: 'Levice' },
  { name: 'Šaľa', kind: 'city', district: 'Šaľa' },
  { name: 'Šamorín', kind: 'city', district: 'Dunajská Streda' },
  { name: 'Senec', kind: 'city', district: 'Senec' },
  { name: 'Senica', kind: 'city', district: 'Senica' },
  { name: 'Sereď', kind: 'city', district: 'Galanta' },
  { name: 'Skalica', kind: 'city', district: 'Skalica' },
  { name: 'Snina', kind: 'city', district: 'Snina' },
  { name: 'Spišská Nová Ves', kind: 'city', district: 'Spišská Nová Ves' },
  { name: 'Spišské Podhradie', kind: 'city', district: 'Levoča' },
  { name: 'Stará Ľubovňa', kind: 'city', district: 'Stará Ľubovňa' },
  { name: 'Stará Turá', kind: 'city', district: 'Nové Mesto nad Váhom' },
  { name: 'Stropkov', kind: 'city', district: 'Stropkov' },
  { name: 'Štúrovo', kind: 'city', district: 'Nové Zámky' },
  { name: 'Svidník', kind: 'city', district: 'Svidník' },
  { name: 'Topoľčany', kind: 'city', district: 'Topoľčany' },
  { name: 'Trebišov', kind: 'city', district: 'Trebišov' },
  { name: 'Trenčín', kind: 'city', district: 'Trenčín' },
  { name: 'Trnava', kind: 'city', district: 'Trnava' },
  { name: 'Trstená', kind: 'city', district: 'Tvrdošín' },
  { name: 'Turčianske Teplice', kind: 'city', district: 'Turčianske Teplice' },
  { name: 'Turzovka', kind: 'city', district: 'Čadca' },
  { name: 'Tvrdošín', kind: 'city', district: 'Tvrdošín' },
  { name: 'Veľký Krtíš', kind: 'city', district: 'Veľký Krtíš' },
  { name: 'Vráble', kind: 'city', district: 'Nitra' },
  { name: 'Vranov nad Topľou', kind: 'city', district: 'Vranov nad Topľou' },
  { name: 'Vrútky', kind: 'city', district: 'Martin' },
  { name: 'Vysoké Tatry', kind: 'city', district: 'Poprad' },
  { name: 'Žiar nad Hronom', kind: 'city', district: 'Žiar nad Hronom' },
  { name: 'Zlaté Moravce', kind: 'city', district: 'Zlaté Moravce' },
  { name: 'Zvolen', kind: 'city', district: 'Zvolen' },
  { name: 'Kysucký Lieskovec', kind: 'village', district: 'Kysucké Nové Mesto' },
  { name: 'Povina', kind: 'village', district: 'Kysucké Nové Mesto' },
  { name: 'Radoľa', kind: 'village', district: 'Kysucké Nové Mesto' },
  { name: 'Rudinka', kind: 'village', district: 'Kysucké Nové Mesto' },
  { name: 'Oščadnica', kind: 'village', district: 'Čadca' },
  { name: 'Raková', kind: 'village', district: 'Čadca' },
  { name: 'Staškov', kind: 'village', district: 'Čadca' },
  { name: 'Terchová', kind: 'village', district: 'Žilina' },
  { name: 'Čičmany', kind: 'village', district: 'Žilina' },
  { name: 'Heľpa', kind: 'village', district: 'Brezno' },
  { name: 'Špania Dolina', kind: 'village', district: 'Banská Bystrica' },
  { name: 'Zuberec', kind: 'village', district: 'Tvrdošín' },
  { name: 'Ždiar', kind: 'village', district: 'Poprad' },
  { name: 'Hrabušice', kind: 'village', district: 'Spišská Nová Ves' },
  { name: 'Vranie', kind: 'borough', district: 'Žilina' },
  { name: 'Žilina, AS', kind: 'bus', district: 'Žilina' },
  { name: 'Žilina, žel. st.', kind: 'train', district: 'Žilina' },
  { name: 'Čadca, aut. st.', kind: 'bus', district: 'Čadca' },
  { name: 'Čadca, žel. st.', kind: 'train', district: 'Čadca' },
  { name: 'Bratislava, Segnerova', kind: 'mhd', district: 'Bratislava' },
  { name: 'Žilina, Hlinská', kind: 'bus', district: 'Žilina' },
]

// More villages from all over Slovakia: [name, district].
const MORE_VILLAGES: [string, string][] = [
  ['Horné Semerovce', 'Levice'],
  ['Dolné Semerovce', 'Levice'],
  ['Liptovský Ján', 'Liptovský Mikuláš'],
  ['Važec', 'Liptovský Mikuláš'],
  ['Pribylina', 'Liptovský Mikuláš'],
  ['Východná', 'Liptovský Mikuláš'],
  ['Štrba', 'Poprad'],
  ['Gánovce', 'Poprad'],
  ['Svit', 'Poprad'],
  ['Čierny Balog', 'Brezno'],
  ['Dobšiná', 'Rožňava'],
  ['Betliar', 'Rožňava'],
  ['Hrhov', 'Rožňava'],
  ['Zázrivá', 'Dolný Kubín'],
  ['Oravský Podzámok', 'Dolný Kubín'],
  ['Podbiel', 'Tvrdošín'],
  ['Habovka', 'Tvrdošín'],
  ['Oravice', 'Tvrdošín'],
  ['Bešeňová', 'Ružomberok'],
  ['Lúčky', 'Ružomberok'],
  ['Podolínec', 'Stará Ľubovňa'],
  ['Hniezdne', 'Stará Ľubovňa'],
  ['Lechnica', 'Stará Ľubovňa'],
  ['Červený Kláštor', 'Kežmarok'],
  ['Spišská Belá', 'Kežmarok'],
  ['Spišský Štvrtok', 'Levoča'],
  ['Mlynky', 'Gelnica'],
  ['Smolník', 'Gelnica'],
  ['Jasov', 'Košice-okolie'],
  ['Turňa nad Bodvou', 'Košice-okolie'],
  ['Moldava nad Bodvou', 'Košice-okolie'],
  ['Medzev', 'Košice-okolie'],
  ['Sečovce', 'Trebišov'],
  ['Kráľovský Chlmec', 'Trebišov'],
  ['Sobrance', 'Sobrance'],
  ['Remetské Hámre', 'Sobrance'],
  ['Ulič', 'Snina'],
  ['Vinné', 'Michalovce'],
  ['Ruská Nová Ves', 'Prešov'],
  ['Kapušany', 'Prešov'],
  ['Veľký Šariš', 'Prešov'],
  ['Trenčianske Teplice', 'Trenčín'],
  ['Trenčianska Teplá', 'Trenčín'],
  ['Beckov', 'Nové Mesto nad Váhom'],
  ['Čachtice', 'Nové Mesto nad Váhom'],
  ['Vrbové', 'Piešťany'],
  ['Banka', 'Piešťany'],
  ['Moravany nad Váhom', 'Piešťany'],
  ['Handlová', 'Prievidza'],
  ['Nitrianske Pravno', 'Prievidza'],
  ['Chynorany', 'Partizánske'],
  ['Svätý Jur', 'Pezinok'],
  ['Jelka', 'Galanta'],
  ['Veľké Úľany', 'Galanta'],
  ['Vlčany', 'Šaľa'],
  ['Trstice', 'Galanta'],
  ['Hronský Beňadik', 'Žiar nad Hronom'],
  ['Slovenská Ľupča', 'Banská Bystrica'],
  ['Donovaly', 'Banská Bystrica'],
  ['Badín', 'Banská Bystrica'],
  ['Lieskovec', 'Zvolen'],
  ['Sliač', 'Zvolen'],
  ['Hriňová', 'Detva'],
  ['Poltár', 'Poltár'],
  ['Tornaľa', 'Revúca'],
  ['Fiľakovo', 'Lučenec'],
  ['Hnúšťa', 'Rimavská Sobota'],
  ['Šurany', 'Nové Zámky'],
  ['Palárikovo', 'Nové Zámky'],
  ['Gbelce', 'Štúrovo'],
  ['Veľký Meder', 'Dunajská Streda'],
  ['Gabčíkovo', 'Dunajská Streda'],
  ['Rusovce', 'Bratislava'],
  ['Záhorská Bystrica', 'Bratislava'],
  ['Stupava', 'Malacky'],
  ['Borinka', 'Malacky'],
  ['Holíč', 'Skalica'],
  ['Gbely', 'Skalica'],
  ['Brezová pod Bradlom', 'Myjava'],
  ['Podhájska', 'Nové Zámky'],
]

// Which stops a town or a village is given. Which of them, and in which order, depends only on the name, so the demo
// always shows the same list.
const TOWN_STOPS = [
  'aut. st.',
  'žel. st.',
  'nám.',
  'nemocnica',
  'Hlavná',
  'poliklinika',
  'pošta',
  'ZŠ',
  'cintorín',
  'obchodné centrum',
  'sídlisko',
  'námestie',
]
const VILLAGE_STOPS = [
  'rázc.',
  'obec',
  'Jednota',
  'pohostinstvo',
  'ZŠ',
  'kostol',
  'OcÚ',
  'most',
  'dolina',
  'otočka',
  'kaplnka',
]
const CITY_TRANSIT_STOPS = [
  'Hlavná stanica',
  'Autobusová stanica',
  'Námestie',
  'Nemocnica',
  'Mestský úrad',
  'Obchodné centrum',
  'Sídlisko',
  'Univerzita',
  'Štadión',
  'Cintorín',
  'Poliklinika',
  'Park',
]
const CITY_TRANSIT = [
  'Bratislava',
  'Košice',
  'Žilina',
  'Prešov',
  'Nitra',
  'Trnava',
  'Banská Bystrica',
  'Trenčín',
  'Martin',
  'Poprad',
  'Zvolen',
  'Prievidza',
  'Michalovce',
  'Komárno',
]

function hash(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** `count` of `names`, picked by the town's name. */
function pick(names: string[], seed: string, count: number): string[] {
  const start = hash(seed)
  return names
    .map((name, i) => ({ name, order: hash(`${seed}/${name}/${start}${i}`) }))
    .sort((a, b) => a.order - b.order)
    .slice(0, count)
    .map((x) => x.name)
}

function generateStops(places: Place[]): Place[] {
  const out: Place[] = []
  for (const place of places) {
    if (place.kind === 'city') {
      for (const stop of pick(TOWN_STOPS, place.name, 6)) {
        const kind = stop === 'žel. st.' ? 'train' : 'bus'
        out.push({ name: `${place.name}, ${stop}`, kind, district: place.district })
      }
      if (CITY_TRANSIT.includes(place.name)) {
        for (const stop of pick(CITY_TRANSIT_STOPS, `mhd-${place.name}`, 8))
          out.push({ name: `${place.name}, ${stop}`, kind: 'mhd', district: place.district })
      }
    } else if (place.kind === 'village') {
      for (const stop of pick(VILLAGE_STOPS, place.name, 4))
        out.push({ name: `${place.name}, ${stop}`, kind: 'bus', district: place.district })
    }
  }
  return out
}

const VILLAGES: Place[] = MORE_VILLAGES.map(([name, district]) => ({ name, kind: 'village', district }))
const STARTING = [...BASE_PLACES, ...VILLAGES]

/** The sample the stop lists are made from: towns, villages and a large number of stops, A to Z, without repeats. */
export const PLACES: Place[] = (() => {
  const seen = new Set<string>()
  const collator = new Intl.Collator('sk')
  return [...STARTING, ...generateStops(STARTING)]
    .filter((place) => !seen.has(place.name) && !!seen.add(place.name))
    .sort((a, b) => collator.compare(a.name, b.name))
})()

export const STOP_SUGGESTIONS = PLACES.map((place) => place.name)
/** Towns with their own city transit (MHD). The full list from the old Ubian. */
export const CITIES = [
  'Banská Bystrica',
  'Bardejov',
  'Bratislava',
  'Bratislava a IDS BK',
  'Bánovce nad Bebravou',
  'Dolný Kubín',
  'Dunajská Streda',
  'Galanta',
  'Hlohovec',
  'Humenné',
  'Kežmarok',
  'Komárno',
  'Košice',
  'Kysucké Nové Mesto',
  'Levice',
  'Levoča',
  'Liptovský Mikuláš',
  'Lučenec',
  'Malacky',
  'Martin',
  'Michalovce',
  'Nitra',
  'Nové Mesto nad Váhom',
  'Nové Zámky',
  'Partizánske',
  'Pezinok',
  'Piešťany',
  'Poprad',
  'Považská Bystrica',
  'Prešov',
  'Prievidza',
  'Púchov',
  'Rimavská Sobota',
  'Rožňava',
  'Ružomberok',
  'Senica',
  'Sereď',
  'Skalica',
  'Spišská Nová Ves',
  'Stará Ľubovňa',
  'Svit',
  'Topoľčany',
  'Trenčín',
  'Trnava',
  'Vranov nad Topľou',
  'Vráble',
  'Zvolen',
  'Čadca',
  'Šahy',
  'Šaľa',
  'Štúrovo',
  'Šurany',
  'Žiar nad Hronom',
  'Žilina',
]

// Real positions of the stops (from OpenStreetMap), so the route on the map follows the valley. The real API sends
// exact coordinates too, so this goes away together with the mock.
const s = (name: string, time: string, lng: number, lat: number): Stop => ({ name, time, lng, lat })

const bus111: TransitLeg = {
  kind: 'transit',
  mode: 'bus',
  line: 'Autobus 111',
  operator: 'SAD Žilina',
  delayMin: 0,
  price: 1.9,
  zones: '202, 205, 206',
  stops: [
    s('Zborov nad Bystricou, p. Rubáňom', '04:56', 18.8904, 49.3759),
    s('Zborov nad Bystricou, ZŠ', '04:58', 18.8834, 49.3816),
    s('Zborov nad Bystricou, U Komanov', '05:00', 18.8737, 49.3884),
    s('Krásno nad Kysucou, Kalinov', '05:02', 18.8573, 49.3963),
    s('Krásno nad Kysucou, Jozefíkovci', '05:03', 18.851, 49.3979),
    s('Krásno nad Kysucou, rázc.', '05:05', 18.8417, 49.4),
    s('Krásno nad Kysucou, ústredie', '05:10', 18.8322, 49.392),
    s('Krásno nad Kysucou, u Drozdov', '05:15', 18.8215, 49.3655),
    s('Kysucký Lieskovec, hlavná cesta', '05:20', 18.8121, 49.3389),
    s('Povina, Jednota', '05:23', 18.8044, 49.3137),
    s('Kysucké Nové Mesto, Dlh. Poľského Biely dom', '05:26', 18.786, 49.2987),
  ],
}

const bus113: TransitLeg = {
  kind: 'transit',
  mode: 'bus',
  line: 'Autobus 113',
  operator: 'SAD Žilina',
  delayMin: 0,
  price: 1.9,
  zones: '206, 207',
  stops: [
    s('Kysucké Nové Mesto, Dlh. Poľského Biely dom', '06:04', 18.786, 49.2987),
    s('Radoľa, pri moste', '06:05', 18.7874, 49.2967),
    s('Kysucké Nové Mesto, Oškerda, Jednota', '06:08', 18.7681, 49.2782),
    s('Rudinka, rázc.', '06:09', 18.7496, 49.2714),
    s('Vranie, Brodno', '06:13', 18.7506, 49.2583),
    s('Žilina, Strážov', '06:16', 18.733, 49.243),
    s('Žilina, Hlinská', '06:18', 18.736, 49.2096),
    s('Žilina, AS', '06:20', 18.7468, 49.2243),
  ],
}

const bus225: TransitLeg = {
  kind: 'transit',
  mode: 'bus',
  line: 'Autobus 225',
  operator: 'SAD Žilina',
  delayMin: 17,
  price: 1.4,
  zones: '202, 203',
  stops: [
    s('Zborov nad Bystricou, p. Rubáňom', '05:00', 18.8904, 49.3759),
    s('Krásno nad Kysucou, rázc.', '05:12', 18.8417, 49.4),
    s('Čadca, aut. st.', '05:26', 18.7856, 49.4447),
  ],
}

const trainS2: TransitLeg = {
  kind: 'transit',
  mode: 'train',
  line: 'S2',
  operator: 'ZSSK',
  delayMin: 0,
  price: 3.2,
  zones: '',
  stops: [
    s('Čadca, žel. st.', '06:04', 18.7869, 49.4453),
    s('Kysucké Nové Mesto', '06:22', 18.7841, 49.3051),
    s('Žilina, žel. st.', '06:42', 18.7449, 49.224),
  ],
}

export function shift(leg: Leg, minutes: number): Leg {
  return {
    ...leg,
    stops: leg.stops.map((st) => ({ ...st, time: formatTime(toMinutes(st.time) + minutes) })),
  } as Leg
}

const FORWARD_CONNECTIONS: Connection[] = [
  { id: 'c1', inMin: 9, legs: [bus111, bus113] },
  {
    id: 'c2',
    inMin: 13,
    legs: [
      bus225,
      {
        kind: 'walk',
        minutes: 4,
        stops: [
          s('Čadca, aut. st.', '05:26', 18.7856, 49.4447),
          s('Čadca, žel. st.', '05:30', 18.7869, 49.4453),
        ],
      },
      trainS2,
    ],
  },
  { id: 'c3', inMin: 43, legs: [shift(bus111, 34), shift(bus113, 34)] },
]

/** One leg driven the other way: stops reversed, times counted forward from startMin with the same stop-to-stop gaps. */
function reverseLeg(leg: Leg, startMin: number): Leg {
  const times = leg.stops.map((st) => toMinutes(st.time))
  const last = times[times.length - 1]
  const stops = [...leg.stops].reverse().map((st, i) => ({
    ...st,
    time: formatTime(startMin + (last - times[times.length - 1 - i])),
  }))
  return { ...leg, stops } as Leg
}

/** The data above runs Zborov to Žilina. The demo journey is the other way round, so the legs are turned around. */
export function reverseConnection(connection: Connection): Connection {
  const { legs } = connection
  const endOf = (leg: Leg) => toMinutes(leg.stops[leg.stops.length - 1].time)
  const startOf = (leg: Leg) => toMinutes(leg.stops[0].time)
  let cursor = endOf(legs[legs.length - 1])
  const turned: Leg[] = []
  for (let k = legs.length - 1; k >= 0; k--) {
    const leg = reverseLeg(legs[k], cursor)
    turned.push(leg)
    const wait = k > 0 ? startOf(legs[k]) - endOf(legs[k - 1]) : 0
    cursor = endOf(leg) + wait
  }
  return { ...connection, legs: turned }
}

/** Zborov nad Bystricou to Žilina. The other way round is made with reverseConnection. */
export const ZBOROV_TO_ZILINA: Connection[] = FORWARD_CONNECTIONS

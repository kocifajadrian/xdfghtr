import type { ReactNode } from 'react'
import { ArrowUpDown, Building2, CalendarDays, ChevronDown } from 'lucide-react'
import { CardVisual as TransportCardVisual } from '@/features/cards/CardVisual'
import { initialCards } from '@/features/cards/mock-data'
import { ConnectionCard } from '@/features/timetables/ConnectionCard'
import { ModeDot } from '@/features/timetables/mode'
import type { Connection } from '@/features/timetables/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

// Illustrations for the home page sections. They only contain numbers, names and symbols that read the same in
// every language, so none of them needs translating.

const frame = 'bg-card border rounded-3xl shadow-sm'

/** Two stacked transport cards that float gently. The front one is the same card as in "Transport cards". */
export function CardVisual() {
  const demo = initialCards()[0]!
  return (
    <div className="relative mx-auto aspect-[1.5] w-full max-w-xs">
      <div className="bg-muted absolute inset-x-6 top-0 aspect-[1.586] -rotate-6 rounded-2xl border" />
      <div className="float-slow absolute inset-x-0 bottom-0 rotate-3 shadow-xl">
        <TransportCardVisual card={demo} masked anonymous />
      </div>
    </div>
  )
}

const stop = (name: string, time: string) => ({ name, time, lng: 0, lat: 0 })
const leg = (
  mode: 'bus' | 'train',
  line: string,
  from: [string, string],
  to: [string, string],
  delayMin: number,
): Connection['legs'][number] => ({
  kind: 'transit',
  mode,
  line,
  operator: '',
  delayMin,
  price: 0,
  zones: '',
  stops: [stop(...from), stop(...to)],
})

// The same results the real search shows: two connections with one transfer, the first one late.
const DEMO_RESULTS: Connection[] = [
  {
    id: 'a',
    inMin: 9,
    legs: [
      leg('bus', 'Autobus 113', ['Žilina', '06:20'], ['Čadca', '06:52'], 9),
      leg('bus', 'Autobus 111', ['Čadca', '07:02'], ['Zborov nad Bystricou', '07:44'], 0),
    ],
  },
  {
    id: 'c',
    inMin: 159,
    legs: [
      leg('bus', 'Autobus 113', ['Žilina', '08:50'], ['Čadca', '09:22'], 0),
      leg('train', 'R 801', ['Čadca', '09:32'], ['Zborov nad Bystricou', '10:14'], 0),
    ],
  },
]

/** One row of the search form: a round icon, the name and what kind of place it is. */
function PlaceRow({
  icon,
  name,
  kind,
  district,
}: {
  icon: ReactNode
  name: string
  kind: string
  district: string
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border px-3 py-2.5">
      {icon}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {kind}, {district}
        </span>
      </span>
    </div>
  )
}

/**
 * The timetable search as it looks in the app: the transport type and the time, the two places and the connections
 * found. It reuses the real result card, so the two cannot drift apart. It is a picture only, nothing in it can be used.
 */
export function SearchVisual() {
  const { t } = useI18n()
  return (
    <div
      inert
      className={cn(
        frame,
        'pointer-events-none mx-auto grid w-full max-w-sm gap-2.5 p-4 select-none [transform:perspective(1100px)_rotateY(14deg)_rotateX(3deg)_rotateZ(-4deg)] shadow-xl',
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
          <span className="truncate">
            {t('tt.type.bus')}, {t('tt.type.train')}
          </span>
          <ChevronDown className="text-muted-foreground size-4" aria-hidden />
        </div>
        <div className="bg-card flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <CalendarDays className="text-muted-foreground size-4" aria-hidden />
          {t('tt.when.now')}
        </div>
      </div>

      <div className="relative grid gap-2">
        <PlaceRow
          icon={<ModeDot mode="train" className="size-6" />}
          name="Žilina, žel. st."
          kind={t('tt.place.train')}
          district={t('tt.place.district', { district: 'Žilina' })}
        />
        <PlaceRow
          icon={
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
              <Building2 className="size-3.5" aria-hidden />
            </span>
          }
          name="Zborov nad Bystricou"
          kind={t('tt.place.village')}
          district={t('tt.place.district', { district: 'Čadca' })}
        />
        <span className="bg-card absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm">
          <ArrowUpDown className="size-4" aria-hidden />
        </span>
      </div>

      {DEMO_RESULTS.map((connection, i) => (
        <div key={connection.id} className="row-in" style={{ animationDelay: `${i * 150}ms` }}>
          <ConnectionCard connection={connection} selected={false} onSelect={() => {}} />
        </div>
      ))}
    </div>
  )
}

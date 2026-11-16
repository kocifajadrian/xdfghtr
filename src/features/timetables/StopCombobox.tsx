import { useMemo, useState } from 'react'
import { Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18n, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import { ModeDot } from './mode'
import { PLACES, STOP_SUGGESTIONS, type Place } from './mock-data'

/** Lower case without accents, so "zil" finds "Žilina". */
export const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Search keys of all places, worked out once (the sample is large). */
const INDEX = PLACES.map((place) => ({ place, key: plain(place.name) }))

/** The list shows this many rows at first and adds as many again when scrolled to the end, so it never has to draw
 * the whole sample at once. The real API will page its results the same way. */
const PAGE = 40
/** Round icon of a place: the coloured transport icon for stops, a building in the theme colour for towns and villages. */
function PlaceIcon({ kind }: { kind: Place['kind'] }) {
  if (kind === 'bus' || kind === 'train' || kind === 'mhd') return <ModeDot mode={kind} className="size-6" />
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
    >
      <Building2 className="size-3.5 text-inherit!" />
    </span>
  )
}

/** Name of a place with its kind and district under it, e.g. "Mesto, okr. Žilina". */
function PlaceText({ place }: { place: Place }) {
  const { t } = useI18n()
  return (
    <span className="flex min-w-0 flex-1 flex-col text-start">
      <span className="truncate font-medium">{place.name}</span>
      <span className="text-muted-foreground truncate text-xs font-normal">
        {t(`tt.place.${place.kind}` as MessageKey)}, {t('tt.place.district', { district: place.district })}
      </span>
    </span>
  )
}
/**
 * Field for a start or destination: a button that opens a searchable list of stops.
 * Text that is not in the list can be used too (the first row offers it).
 */
export function StopCombobox({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  label,
  iconClassName,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  label: string
  iconClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)

  // The chosen place, with its icon and description. Free text that is not in the list has none.
  const selected = PLACES.find((place) => place.name === value)

  const typed = query.trim()
  // PLACES is already sorted A to Z, so the matches come out in that order.
  const matches = useMemo(() => {
    const key = plain(typed)
    return INDEX.filter((entry) => entry.key.includes(key)).map((entry) => entry.place)
  }, [typed])
  const shown = matches.slice(0, limit)
  const offerTyped = typed !== '' && !STOP_SUGGESTIONS.some((name) => plain(name) === plain(typed))

  function pick(next: string) {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery('')
          setLimit(PAGE)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          className={cn(
            'w-full min-w-0 justify-start gap-2 overflow-hidden font-normal',
            selected ? 'h-auto min-h-9 py-1.5' : 'h-9',
          )}
        >
          {selected ? (
            <>
              <PlaceIcon kind={selected.kind} />
              <PlaceText place={selected} />
            </>
          ) : (
            <>
              <MapPin className={cn('size-4 shrink-0', iconClassName ?? 'text-muted-foreground')} />
              <span className={cn('truncate', !value && 'text-muted-foreground')}>
                {value || placeholder}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={(next) => {
              setQuery(next)
              setLimit(PAGE)
            }}
            placeholder={searchPlaceholder}
          />
          <CommandList
            onScroll={(event) => {
              const list = event.currentTarget
              if (list.scrollTop + list.clientHeight >= list.scrollHeight - 80) setLimit((n) => n + PAGE)
            }}
          >
            <CommandGroup>
              {offerTyped && (
                <CommandItem value={`typed-${typed}`} onSelect={() => pick(typed)}>
                  {typed}
                </CommandItem>
              )}
              {shown.map((place) => (
                <CommandItem key={place.name} value={place.name} onSelect={() => pick(place.name)}>
                  <PlaceIcon kind={place.kind} />
                  <PlaceText place={place} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

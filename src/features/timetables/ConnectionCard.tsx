import { ChevronRight, Footprints } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { MODE_ICON } from './mode'
import { arrival, departure, durationMin, largestDelay, transfers } from './time'
import type { Connection } from './types'

export function useDuration() {
  const { t } = useI18n()
  return (minutes: number) =>
    minutes >= 60 ? t('tt.hm', { h: Math.floor(minutes / 60), m: minutes % 60 }) : t('tt.m', { m: minutes })
}

/** On time (green), a short delay (yellow) or a delay of more than 10 minutes (red). */
export function DelayBadge({ min }: { min: number }) {
  const { t } = useI18n()
  if (min <= 0) {
    return (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
        {t('tt.onTime')}
      </Badge>
    )
  }
  if (min > 10) return <Badge variant="destructive">{t('tt.delay', { min })}</Badge>
  return (
    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
      {t('tt.delay', { min })}
    </Badge>
  )
}

/** One search result. Pressing it selects the connection: the map draws it and the detail opens. */
export function ConnectionCard({
  connection,
  selected,
  onSelect,
}: {
  connection: Connection
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useI18n()
  const duration = useDuration()
  const delay = largestDelay(connection)

  return (
    <Item
      variant="outline"
      size="xs"
      asChild
      className={cn('hover:bg-accent/50 text-left', selected && 'border-primary ring-primary ring-1')}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected}>
        <ItemContent className="gap-1">
          <ItemTitle className="w-full justify-between text-sm font-semibold">
            <span>
              {departure(connection)} → {arrival(connection)}
              {delay > 0 && (
                <span
                  className={cn(
                    'ml-1.5 text-xs font-medium',
                    delay > 10 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400',
                  )}
                  title={t('tt.delay', { min: delay })}
                >
                  +{delay}
                </span>
              )}
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              {duration(durationMin(connection))}
            </span>
          </ItemTitle>

          <span className="flex flex-wrap items-center gap-1">
            {connection.legs.map((leg, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="text-muted-foreground size-3.5" />}
                {leg.kind === 'walk' ? (
                  <Footprints className="text-muted-foreground size-4" aria-hidden="true" />
                ) : (
                  <LinePlain mode={leg.mode} line={leg.line} />
                )}
              </span>
            ))}
          </span>

          <ItemDescription className="text-xs">
            <span>
              {connection.inMin >= 0
                ? t('tt.results.inMin', { time: duration(connection.inMin) })
                : t('tt.results.ago', { time: duration(-connection.inMin) })}{' '}
              · {t('tt.transfers', { n: transfers(connection) })}
            </span>
          </ItemDescription>
        </ItemContent>
      </button>
    </Item>
  )
}

export function LineBadge({ mode, line }: { mode: keyof typeof MODE_ICON; line: string }) {
  const Icon = MODE_ICON[mode]
  return (
    <Badge variant="secondary">
      <Icon aria-hidden="true" />
      {line}
    </Badge>
  )
}

/** The line as plain text with its icon, no pill: on a result card, so there are not many badges next to each other. */
function LinePlain({ mode, line }: { mode: keyof typeof MODE_ICON; line: string }) {
  const Icon = MODE_ICON[mode]
  return (
    <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
      <Icon className="size-3.5" aria-hidden="true" />
      {line}
    </span>
  )
}

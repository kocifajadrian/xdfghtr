import { ArrowLeft, Footprints } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { DelayBadge, LineBadge, useDuration } from './ConnectionCard'
import { durationMin, firstStop, lastStop, toMinutes } from './time'
import type { Connection } from './types'

export function DetailPanel({
  connection,
  activeLeg,
  onActiveLeg,
  onBack,
}: {
  connection: Connection
  activeLeg: number | null
  onActiveLeg: (index: number | null) => void
  onBack: () => void
}) {
  const { t } = useI18n()
  const duration = useDuration()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          {t('tt.detail.back')}
        </Button>
        <span className="text-muted-foreground text-sm">{duration(durationMin(connection))}</span>
      </div>
      <h2 className="text-base font-medium">{t('tt.detail.title')}</h2>

      {connection.legs.map((leg, i) => {
        const previous = connection.legs[i - 1]
        const gap = previous ? toMinutes(firstStop(leg).time) - toMinutes(lastStop(previous).time) : 0

        // A walk leg is one line, "Walk 4 min". The wait before a transit leg is shown the same way.
        if (leg.kind === 'walk') {
          return (
            <p key={i} className="text-muted-foreground flex items-center gap-2 px-1 text-sm">
              <Footprints className="size-4" aria-hidden="true" />
              {t('tt.detail.walk', { min: leg.minutes })}
            </p>
          )
        }

        return (
          <div key={i} className="flex flex-col gap-3">
            {previous?.kind === 'transit' && gap > 0 && (
              <p className="text-muted-foreground px-1 text-sm">{t('tt.detail.wait', { min: gap })}</p>
            )}
            <Card
              size="sm"
              className={cn(activeLeg === i && 'ring-primary ring-2')}
              onMouseEnter={() => onActiveLeg(i)}
              onMouseLeave={() => onActiveLeg(null)}
            >
              <CardHeader className="flex-row items-center justify-between">
                <LineBadge mode={leg.mode} line={leg.line} />
                <DelayBadge min={leg.delayMin} />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ol className="before:bg-border relative grid gap-2 pl-5 text-sm before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px">
                  {leg.stops.map((stop, k) => {
                    const end = k === 0 || k === leg.stops.length - 1
                    return (
                      <li key={k} className="relative flex justify-between gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute top-1.5 -left-5 size-[11px] rounded-full border-2',
                            end ? 'bg-primary border-primary' : 'bg-background border-muted-foreground',
                          )}
                        />
                        <span className={cn(end ? 'font-medium' : 'text-muted-foreground')}>{stop.name}</span>
                        <span className={cn('tabular-nums', end && 'font-medium')}>{stop.time}</span>
                      </li>
                    )
                  })}
                </ol>
                <Separator />
                <dl className="text-muted-foreground grid gap-1 text-xs">
                  <Row label={t('tt.detail.operator')} value={leg.operator} />
                  {leg.zones && <Row label={t('tt.detail.zones')} value={leg.zones} />}
                </dl>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}

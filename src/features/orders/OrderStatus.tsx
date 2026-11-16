import { CircleAlert, CircleCheck, CircleX, Clock, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { OrderStatus } from './types'

const ICON = {
  paid: { Icon: CircleCheck, className: 'text-emerald-600 dark:text-emerald-400' },
  pending: { Icon: Clock, className: 'text-amber-600 dark:text-amber-400' },
  cancelled: { Icon: CircleX, className: 'text-destructive' },
  failed: { Icon: CircleAlert, className: 'text-orange-600 dark:text-orange-400' },
  refunded: { Icon: Undo2, className: 'text-muted-foreground' },
} as const

/** A small icon for the state of an order (green tick, yellow clock, red cross, grey arrow). */
export function StatusIcon({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useI18n()
  const { Icon, className: colour } = ICON[status]
  return (
    <Icon className={cn('size-4 shrink-0', colour, className)} aria-label={t(`orders.status.${status}`)} />
  )
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useI18n()
  const label = t(`orders.status.${status}`)
  if (status === 'cancelled') return <Badge variant="destructive">{label}</Badge>
  if (status === 'failed')
    return (
      <Badge variant="outline" className="border-orange-500/40 text-orange-700 dark:text-orange-300">
        {label}
      </Badge>
    )
  if (status === 'refunded') return <Badge variant="secondary">{label}</Badge>
  return (
    <Badge
      variant="outline"
      className={
        status === 'paid'
          ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/40 text-amber-700 dark:text-amber-300'
      }
    >
      {label}
    </Badge>
  )
}

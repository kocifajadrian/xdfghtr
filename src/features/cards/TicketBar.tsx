import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { ticketDaysLeft, ticketLeftShare } from './format'
import type { CardTicket } from './types'

/** How long the ticket still lasts: "Zostáva 36 d" and a bar that shrinks. */
export function TicketBar({ ticket, className }: { ticket: CardTicket; className?: string }) {
  const { t } = useI18n()
  const days = ticketDaysLeft(ticket)
  const share = ticketLeftShare(ticket)
  return (
    <div className={cn('grid gap-1.5', className)}>
      <p className="text-sm font-medium">
        {days > 0 ? t('cards.ticket.left', { days }) : t('cards.ticket.expired')}
      </p>
      <div
        role="progressbar"
        aria-label={t('cards.ticket')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(share * 100)}
        className="bg-muted h-1.5 overflow-hidden rounded-full"
      >
        <div className="bg-primary h-full rounded-full" style={{ width: `${share * 100}%` }} />
      </div>
    </div>
  )
}

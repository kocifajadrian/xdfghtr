import { useState, type ReactNode } from 'react'
import { Ban, Copy, Leaf, Plus, Ticket, Trash2, Wallet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/i18n'
import { blockCard, orderDuplicate, removeCard } from './api'
import { BuyTicketDialog, ConfirmDialog, TopUpDialog } from './CardDialogs'
import { CardVisual } from './CardVisual'
import { formatCardNumber, ticketDaysLeft, useCardFormat } from './format'
import { TicketBar } from './TicketBar'
import { TransactionsTable } from './TransactionsTable'
import type { TransportCard } from './types'

type Dialog = 'topUp' | 'buy' | 'block' | 'duplicate' | 'remove'

/**
 * One card: its picture and data on the left, on the right what can be done with it:
 * credit, ticket and green kilometres first, then the settings of the card.
 */
export function CardDetail({
  card,
  onChange,
  onRemoved,
}: {
  card: TransportCard
  /** The card after an action, so the page can show the new state. */
  onChange: (card: TransportCard) => void
  onRemoved: (id: string) => void
}) {
  const { t, formatEuro } = useI18n()
  const { date, km, kg } = useCardFormat()
  const [open, setOpen] = useState<Dialog | null>(null)
  const setCard = onChange
  const close = (dialog: Dialog) => (isOpen: boolean) => setOpen(isOpen ? dialog : null)

  const blocked = card.status === 'blocked'
  const hasTicket = card.ticket !== null && ticketDaysLeft(card.ticket) > 0
  const facts: [string, ReactNode][] = [
    [
      t('cards.number'),
      <span key="n" className="tabular-nums">
        {formatCardNumber(card.number)}
      </span>,
    ],
    [t('cards.carrier'), card.carrier],
    [t('cards.kind'), t(`cards.kind.${card.kind}`)],
    [t('cards.validUntil'), date(card.validUntil)],
    ...(card.discountUntil
      ? ([[t('cards.discountUntil'), date(card.discountUntil)]] as [string, ReactNode][])
      : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      {blocked && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>
            {t(card.duplicateOrdered ? 'cards.duplicateNotice' : 'cards.blockedNotice')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-[250px_1fr]">
        {/* Left: the card itself and what is printed on it. */}
        <div className="flex flex-col gap-3">
          <CardVisual card={card} />
          <dl className="bg-card grid gap-1.5 rounded-xl border px-3 py-2.5 text-xs">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <Panel icon={<Leaf />} title={t('cards.greenKm')}>
            <div className="flex flex-wrap gap-x-8 gap-y-1">
              <p className="text-sm">
                <span className="text-lg font-semibold tabular-nums">{km(card.greenKm)}</span>{' '}
                <span className="text-muted-foreground text-xs">{t('cards.greenKm.travelled')}</span>
              </p>
              <p className="text-sm">
                <span className="text-lg font-semibold tabular-nums">{kg(card.co2Kg)}</span>{' '}
                <span className="text-muted-foreground text-xs">{t('cards.co2')}</span>
              </p>
            </div>
          </Panel>
        </div>

        {/* Right: what can be done. */}
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel icon={<Wallet />} title={t('cards.credit')}>
              <p className="text-2xl font-semibold tabular-nums">{formatEuro(card.credit)}</p>
              <p className="text-muted-foreground text-xs">
                {t('cards.creditAsOf', { date: date(card.creditAsOf) })}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button size="sm" onClick={() => setOpen('topUp')} disabled={blocked}>
                  <Plus />
                  {t('cards.topUp')}
                </Button>
              </div>
            </Panel>

            <Panel icon={<Ticket />} title={t('cards.ticket')}>
              {hasTicket ? (
                <>
                  <p className="font-semibold">{card.ticket!.name}</p>
                  <TicketBar ticket={card.ticket!} />
                  <p className="text-muted-foreground text-xs">
                    {date(card.ticket!.from)} – {date(card.ticket!.to)} · {card.ticket!.zones.join(', ')}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">{t('cards.ticket.none')}</p>
              )}
              <div className="mt-auto pt-2">
                <Button
                  size="sm"
                  onClick={() => setOpen('buy')}
                  disabled={blocked}
                  variant={hasTicket ? 'outline' : 'default'}
                >
                  {t(hasTicket ? 'cards.ticket.extend' : 'cards.ticket.buy')}
                </Button>
              </div>
            </Panel>
          </div>

          <Panel title={t('cards.tx.title')} flush>
            <TransactionsTable cardId={card.id} />
          </Panel>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen('duplicate')}
              disabled={card.duplicateOrdered}
            >
              <Copy />
              {t('cards.duplicate')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen('block')} disabled={blocked}>
              <Ban />
              {t('cards.block')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setOpen('remove')}
            >
              <Trash2 />
              {t('cards.remove')}
            </Button>
          </div>
        </div>
      </div>

      <TopUpDialog open={open === 'topUp'} onOpenChange={close('topUp')} card={card} onChange={setCard} />
      <BuyTicketDialog open={open === 'buy'} onOpenChange={close('buy')} card={card} onChange={setCard} />
      <ConfirmDialog
        open={open === 'duplicate'}
        onOpenChange={close('duplicate')}
        title={t('cards.duplicate')}
        text={t('cards.duplicate.confirm')}
        confirmLabel={t('cards.duplicate.action')}
        onConfirm={async () => setCard(await orderDuplicate(card.id))}
      />
      <ConfirmDialog
        open={open === 'block'}
        onOpenChange={close('block')}
        title={t('cards.block')}
        text={t('cards.block.confirm')}
        confirmLabel={t('cards.block.action')}
        destructive
        onConfirm={async () => setCard(await blockCard(card.id))}
      />
      <ConfirmDialog
        open={open === 'remove'}
        onOpenChange={close('remove')}
        title={t('cards.remove')}
        text={t('cards.remove.confirm')}
        confirmLabel={t('cards.remove.action')}
        destructive
        onConfirm={async () => {
          await removeCard(card.id)
          onRemoved(card.id)
        }}
      />
    </div>
  )
}

function Panel({
  icon,
  title,
  children,
  flush,
}: {
  icon?: ReactNode
  title: string
  children: ReactNode
  /** The content brings its own side padding (a table). */
  flush?: boolean
}) {
  return (
    <Card className="gap-1.5 py-3">
      <CardHeader className="px-4">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium [&_svg]:size-4">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`flex flex-1 flex-col gap-1 ${flush ? 'px-0' : 'px-4'}`}>
        {children}
      </CardContent>
    </Card>
  )
}

import { useState, type FormEvent, type ReactNode } from 'react'
import { CircleCheck, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import { PaymentFields, usePayment } from './PaymentMethods'
import { buyTicket, CardError, topUpCredit } from './api'
import { MAX_TOP_UP, MIN_TOP_UP, parseAmount, useCardFormat } from './format'
import { TICKET_OPTIONS } from './mock-data'
import type { TransportCard } from './types'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: TransportCard
  /** The card after the action, so the page can show the new state. */
  onChange: (card: TransportCard) => void
}

/** Runs an action of a dialog: a busy flag and a readable error. */
function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<MessageKey | null>(null)
  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    setBusy(true)
    setError(null)
    try {
      return await action()
    } catch (err) {
      setError(err instanceof CardError ? err.key : 'cards.error')
      return null
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run }
}

function ErrorNote({ error }: { error: MessageKey | null }) {
  const { t } = useI18n()
  return (
    error && (
      <Alert variant="destructive">
        <AlertDescription>{t(error)}</AlertDescription>
      </Alert>
    )
  )
}

function Success({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center text-sm">
      <CircleCheck className="text-primary size-10" />
      <p>{children}</p>
    </div>
  )
}

function DoneFooter({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  return (
    <DialogFooter>
      <Button type="button" onClick={onClose} className="w-full sm:w-auto">
        {t('cards.done')}
      </Button>
    </DialogFooter>
  )
}

/** The two buttons of the payment step: back to shopping and pay. */
function PayButtons({ busy, label, onBack }: { busy: boolean; label: string; onBack: () => void }) {
  const { t } = useI18n()
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button type="button" variant="secondary" onClick={onBack} disabled={busy}>
        {t('cards.pay.continue')}
      </Button>
      <Button type="submit" disabled={busy}>
        <Spin busy={busy} />
        {label}
      </Button>
    </div>
  )
}

function Spin({ busy }: { busy: boolean }) {
  return busy ? <LoaderCircle className="animate-spin" /> : null
}

// ---------------------------------------------------------------------------------------------------------------------
// Top up credit

const PRESETS = [5, 10, 20, 50]

export function TopUpDialog({ open, onOpenChange, card, onChange }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <TopUpContent card={card} onChange={onChange} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function TopUpContent({
  card,
  onChange,
  onClose,
}: {
  card: TransportCard
  onChange: (card: TransportCard) => void
  onClose: () => void
}) {
  const { t, formatEuro } = useI18n()
  const { busy, error, run } = useAction()
  const [text, setText] = useState('10')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState<TransportCard | null>(null)
  const payment = usePayment()
  const amount = parseAmount(text)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (amount === null || busy) return
    const updated = await run(() => topUpCredit(card.id, amount, payment.method))
    if (updated) {
      onChange(updated)
      setDone(updated)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('cards.topUp')}</DialogTitle>
        <DialogDescription>{card.holder}</DialogDescription>
      </DialogHeader>

      {done ? (
        <>
          <Success>{t('cards.topUp.success', { credit: formatEuro(done.credit) })}</Success>
          <DoneFooter onClose={onClose} />
        </>
      ) : (
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <div className="grid gap-2">
            <Label>{t('cards.topUp.amount')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? 'default' : 'outline'}
                  aria-pressed={amount === preset}
                  onClick={() => setText(String(preset))}
                >
                  {formatEuro(preset)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="top-up-amount">{t('cards.topUp.custom')}</Label>
            <Input
              id="top-up-amount"
              inputMode="decimal"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={touched && amount === null}
              autoComplete="off"
            />
            {touched && amount === null && (
              <p className="text-destructive text-sm">
                {t('cards.topUp.invalid', { min: formatEuro(MIN_TOP_UP), max: formatEuro(MAX_TOP_UP) })}
              </p>
            )}
          </div>

          <PaymentFields payment={payment} />
          <ErrorNote error={error} />

          <PayButtons
            busy={busy}
            label={t('cards.topUp.pay', { amount: formatEuro(amount ?? 0) })}
            onBack={onClose}
          />
        </form>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Buy a time ticket

export function BuyTicketDialog({ open, onOpenChange, card, onChange }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <BuyContent card={card} onChange={onChange} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function BuyContent({
  card,
  onChange,
  onClose,
}: {
  card: TransportCard
  onChange: (card: TransportCard) => void
  onClose: () => void
}) {
  const { t, formatEuro } = useI18n()
  const { date } = useCardFormat()
  const { busy, error, run } = useAction()
  const [optionId, setOptionId] = useState('90')
  const [done, setDone] = useState<TransportCard | null>(null)
  const payment = usePayment()
  const option = TICKET_OPTIONS.find((o) => o.id === optionId) ?? TICKET_OPTIONS[0]
  const creditShort = card.credit < option.price
  const short = payment.method === 'credit' && creditShort
  const extending = card.ticket !== null

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (short || busy) return
    const updated = await run(() => buyTicket(card.id, option.id, payment.method))
    if (updated) {
      onChange(updated)
      setDone(updated)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{extending ? t('cards.ticket.extend') : t('cards.ticket.buy')}</DialogTitle>
        <DialogDescription>{t('cards.buy.text')}</DialogDescription>
      </DialogHeader>

      {done ? (
        <>
          <Success>
            {t('cards.buy.success', {
              to: date(done.ticket!.to),
            })}
          </Success>
          <DoneFooter onClose={onClose} />
        </>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          <div role="radiogroup" aria-label={t('cards.ticket')} className="grid gap-2">
            {TICKET_OPTIONS.map((o) => {
              const selected = o.id === optionId
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setOptionId(o.id)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    'focus-visible:ring-ring outline-none focus-visible:ring-2',
                    selected ? 'border-primary bg-accent' : 'hover:bg-accent/50',
                  )}
                >
                  <span className="font-medium">{t('cards.buy.option', { days: o.days })}</span>
                  <span className="tabular-nums">{formatEuro(o.price)}</span>
                </button>
              )
            })}
          </div>

          <PaymentFields
            payment={payment}
            creditOption={{
              label: t('cards.pay.credit', { credit: formatEuro(card.credit) }),
              unavailable: creditShort ? t('cards.buy.short') : undefined,
            }}
          />
          <ErrorNote error={error} />

          <PayButtons
            busy={busy}
            label={t('cards.buy.pay', { amount: formatEuro(option.price) })}
            onBack={onClose}
          />
        </form>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Confirm (block, duplicate, remove)

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  text,
  confirmLabel,
  destructive = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  text: string
  confirmLabel: string
  destructive?: boolean
  /** Does the action. The dialog closes when it did not throw. */
  onConfirm: () => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <ConfirmContent
          title={title}
          text={text}
          confirmLabel={confirmLabel}
          destructive={destructive}
          onConfirm={onConfirm}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ConfirmContent({
  title,
  text,
  confirmLabel,
  destructive,
  onConfirm,
  onClose,
}: {
  title: string
  text: string
  confirmLabel: string
  destructive: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const { t } = useI18n()
  const { busy, error, run } = useAction()

  async function confirm() {
    const result = await run(async () => {
      await onConfirm()
      return true
    })
    if (result) onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{text}</DialogDescription>
      </DialogHeader>
      <ErrorNote error={error} />
      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          {t('cards.cancel')}
        </Button>
        <Button
          type="button"
          variant={destructive ? 'destructive' : 'default'}
          onClick={confirm}
          disabled={busy}
        >
          <Spin busy={busy} />
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  )
}

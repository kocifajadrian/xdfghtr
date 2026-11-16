import { useState } from 'react'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from './types'

/** The card the person asked to remember last time (the demo has one). Shown as the end of its number. */
const SAVED_CARD_END = '4242'

/** The choice of the payment step. Keep it in the dialog and pass it to <PaymentFields />. */
export function usePayment(initial: PaymentMethod = 'card') {
  const [method, setMethod] = useState<PaymentMethod>(initial)
  return { method, setMethod }
}
export type Payment = ReturnType<typeof usePayment>

/**
 * "Choose a payment method": Visa / Mastercard, the saved card, TatraPay and Google Pay, and optionally the credit
 * on the card. The buttons are the dialog's own.
 */
export function PaymentFields({
  payment,
  creditOption,
}: {
  payment: Payment
  /** Offer paying from the credit on the card: its text (with the balance), and why it cannot be chosen if so. */
  creditOption?: { label: string; unavailable?: string }
}) {
  const { t } = useI18n()
  const rows: { value: PaymentMethod; label: string; unavailable?: string }[] = [
    { value: 'card', label: t('cards.pay.card') },
    { value: 'savedCard', label: t('cards.pay.saved', { end: SAVED_CARD_END }) },
    { value: 'tatrapay', label: 'TatraPay' },
    { value: 'googlePay', label: 'Google Pay' },
    ...(creditOption
      ? [{ value: 'credit' as const, label: creditOption.label, unavailable: creditOption.unavailable }]
      : []),
  ]

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">{t('cards.pay.title')}</p>
      <div
        role="radiogroup"
        aria-label={t('cards.pay.title')}
        className="bg-muted/40 divide-y rounded-lg border"
      >
        {rows.map((row) => {
          const selected = payment.method === row.value
          return (
            <button
              key={row.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!!row.unavailable}
              onClick={() => payment.setMethod(row.value)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                'focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-inset',
                'enabled:hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px]',
                  selected && 'border-primary bg-primary text-primary-foreground',
                )}
              >
                {selected && '✓'}
              </span>
              <span className="font-medium">{row.label}</span>
              {row.unavailable && <span className="text-muted-foreground text-xs">{row.unavailable}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { Nfc } from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'
import { Wordmark } from '@/components/brand/Wordmark'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { formatCardNumber, lastDigits, useCardFormat } from './format'
import type { TransportCard } from './types'

/**
 * The card as a picture: the logo and the contactless sign on top, the card's data below (number, carrier, type and
 * the dates), like on the printed card. `masked` hides all but the last four digits (list), the detail page shows the
 * whole number. A blocked card is grey.
 */
export function CardVisual({
  card,
  masked = false,
  className,
}: {
  card: TransportCard
  masked?: boolean
  className?: string
}) {
  const { t } = useI18n()
  const { date } = useCardFormat()
  const blocked = card.status === 'blocked'

  const rows: [string, string][] = [
    [t('cards.number'), masked ? lastDigits(card.number) : formatCardNumber(card.number)],
    [t('cards.carrier'), card.carrier],
    [t('cards.kind'), t(`cards.kind.${card.kind}`)],
    [t('cards.validUntil'), date(card.validUntil)],
    ...(card.discountUntil
      ? ([[t('cards.discountUntil'), date(card.discountUntil)]] as [string, string][])
      : []),
  ]

  return (
    <div
      className={cn(
        'relative flex aspect-[1.586] min-h-min w-full flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5 shadow-sm',
        'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground',
        blocked && 'from-muted-foreground/70 to-muted-foreground/40 saturate-0',
        className,
      )}
    >
      {/* Soft circles for depth, like the print on a real card. */}
      <span aria-hidden className={'absolute -right-10 -top-12 size-44 rounded-full bg-white/10'} />
      <span aria-hidden className={'absolute -bottom-16 -left-8 size-48 rounded-full bg-white/10'} />

      <div className="relative flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="inline-flex items-center gap-[0.2em] text-2xl leading-none text-white dark:text-black"
        >
          <BrandMark className="text-inherit" />
          <Wordmark className="text-inherit" />
        </span>
        <Nfc aria-hidden className="size-5 shrink-0 opacity-80" />
      </div>

      <dl className="relative flex flex-col gap-1 text-xs sm:text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="opacity-75">{label}</dt>
            <dd className="truncate text-right font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

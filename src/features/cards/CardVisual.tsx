import { Nfc } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { cn } from '@/lib/utils'
import { formatCardNumber, lastDigits } from './format'
import type { TransportCard } from './types'

/**
 * The card as a picture: carrier on top, number below. `masked` hides all but the last four digits (list),
 * the detail page shows the whole number. A blocked card is grey.
 */
export function CardVisual({
  card,
  masked = false,
  anonymous = false,
  className,
}: {
  card: TransportCard
  masked?: boolean
  /** Leave out the carrier and the holder (a picture on the home page, not a real card). */
  anonymous?: boolean
  className?: string
}) {
  const blocked = card.status === 'blocked'
  return (
    <div
      className={cn(
        'relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-sm',
        'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground',
        blocked && 'from-muted-foreground/70 to-muted-foreground/40 saturate-0',
        className,
      )}
    >
      {/* Soft circles for depth, like the print on a real card. */}
      <span aria-hidden className="absolute -right-10 -top-12 size-44 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-16 -left-8 size-48 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Wordmark className="text-2xl !text-white dark:!text-black" />
          {!anonymous && <p className="mt-2 truncate text-sm font-semibold">{card.carrier}</p>}
        </div>
        <Nfc aria-hidden className="size-5 shrink-0 opacity-80" />
      </div>

      <div className="relative">
        <p className="font-mono text-lg tracking-wider tabular-nums">
          {masked ? lastDigits(card.number) : formatCardNumber(card.number)}
        </p>
        {!anonymous && <p className="mt-0.5 truncate text-xs opacity-80">{card.holder}</p>}
      </div>
    </div>
  )
}

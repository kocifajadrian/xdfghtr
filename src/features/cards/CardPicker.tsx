import { ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { formatCardNumber } from './format'
import type { TransportCard } from './types'

/** What a card looks like in the picker: who it was issued to in bold, the number and the carrier. */
function CardLine({ card }: { card: TransportCard }) {
  const { t } = useI18n()
  return (
    <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
      <span className="flex max-w-full items-center gap-2">
        <span className="truncate font-bold">{card.holder}</span>
        <Badge variant={card.status === 'blocked' ? 'destructive' : 'secondary'}>
          {t(`cards.status.${card.status}`)}
        </Badge>
      </span>
      <span className="text-muted-foreground text-xs tabular-nums">{formatCardNumber(card.number)}</span>
      <span className="text-muted-foreground truncate text-xs">{card.carrier}</span>
    </span>
  )
}

/** A drop-down with the cards of the user. The chosen card is shown on the button. */
export function CardPicker({
  cards,
  selectedId,
  onSelect,
}: {
  cards: TransportCard[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const { t } = useI18n()
  const selected = cards.find((c) => c.id === selectedId) ?? cards[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={t('cards.select')}
          className="h-auto w-full max-w-sm justify-between gap-3 px-3 py-2"
        >
          <CardLine card={selected} />
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) max-w-md">
        {cards.map((card) => (
          <DropdownMenuItem
            key={card.id}
            onSelect={() => onSelect(card.id)}
            className={cn('py-2.5', card.id === selected.id && 'bg-accent')}
          >
            <CardLine card={card} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

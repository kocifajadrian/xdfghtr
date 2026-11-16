import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useOrderFormat } from './format'
import { StatusIcon } from './OrderStatus'
import type { Order } from './types'

/** The orders as cards, one under another (phones, where a table does not fit). */
export function OrderList({
  orders,
  selectedId,
  onSelect,
}: {
  orders: Order[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t, formatEuro } = useI18n()
  const { date } = useOrderFormat()

  return (
    <ItemGroup className="gap-2">
      {orders.map((order) => {
        const selected = order.id === selectedId
        const struck = order.status !== 'paid' && order.status !== 'pending'
        return (
          <Item
            key={order.id}
            variant="outline"
            size="xs"
            asChild
            className={cn('hover:bg-accent/50 text-left', selected && 'border-primary ring-primary ring-1')}
          >
            <button type="button" onClick={() => onSelect(order.id)} aria-pressed={selected}>
              <StatusIcon status={order.status} />
              <ItemContent className="gap-0.5">
                <ItemTitle className="w-full justify-between text-sm font-semibold">
                  <span>{t(`orders.product.${order.product}`)}</span>
                  <span className={cn('tabular-nums', struck && 'text-muted-foreground line-through')}>
                    {formatEuro(order.price)}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-xs">
                  {date(order.createdAt)} · {order.id}
                </ItemDescription>
              </ItemContent>
            </button>
          </Item>
        )
      })}
    </ItemGroup>
  )
}

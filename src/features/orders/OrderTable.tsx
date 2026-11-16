import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useOrderFormat } from './format'
import { StatusIcon } from './OrderStatus'
import type { Sort, SortKey } from './sort'
import type { Order } from './types'

/** A column heading you can press to sort by that column. Pressing it again turns the order around. */
function SortHeading({
  sortKey,
  sort,
  onSort,
  align = 'left',
  children,
}: {
  sortKey: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
  children: string
}) {
  const active = sort.key === sortKey
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead
      className={align === 'right' ? 'text-right' : undefined}
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 inline-flex items-center gap-1 rounded-sm px-1.5 py-1 outline-none focus-visible:ring-3',
          active && 'text-foreground',
        )}
      >
        {children}
        <Icon className={cn('size-3.5', !active && 'opacity-40')} aria-hidden="true" />
      </button>
    </TableHead>
  )
}

/**
 * All orders as a table (wide screens). The date and the price can be sorted by pressing their heading. A row opens
 * the detail. The heading stays in view while the rows scroll.
 */
export function OrderTable({
  orders,
  selectedId,
  onSelect,
  sort,
  onSort,
}: {
  orders: Order[]
  selectedId: string | null
  onSelect: (id: string) => void
  sort: Sort
  onSort: (key: SortKey) => void
}) {
  const { t, formatEuro } = useI18n()
  const { date } = useOrderFormat()

  return (
    // The card around the table scrolls, so the table itself must not (or the heading would not stay on top).
    <Table containerClassName="overflow-visible">
      <TableHeader className="bg-card sticky top-0 z-10">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-8" />
          <SortHeading sortKey="created" sort={sort} onSort={onSort}>
            {t('orders.created')}
          </SortHeading>
          <TableHead>{t('orders.product')}</TableHead>
          <SortHeading sortKey="price" sort={sort} onSort={onSort} align="right">
            {t('orders.price')}
          </SortHeading>
          <TableHead>{t('orders.number')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
              {t('orders.noMatch')}
            </TableCell>
          </TableRow>
        )}
        {orders.map((order) => {
          const select = () => onSelect(order.id)
          return (
            <TableRow
              key={order.id}
              data-state={order.id === selectedId ? 'selected' : undefined}
              className="cursor-pointer"
              onClick={select}
            >
              <TableCell className="pr-0" title={t(`orders.status.${order.status}`)}>
                <StatusIcon status={order.status} />
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {date(order.createdAt)}
              </TableCell>
              <TableCell className="max-w-96">
                {/* One line: the product, then what was bought in grey. The product name is the real button of the row. */}
                <div className="flex min-w-0 items-baseline gap-2">
                  <button
                    type="button"
                    className="focus-visible:ring-ring/50 shrink-0 rounded-sm text-left font-medium outline-none focus-visible:ring-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      select()
                    }}
                  >
                    {t(`orders.product.${order.product}`)}
                  </button>
                  <span className="text-muted-foreground truncate text-xs">{order.description}</span>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium whitespace-nowrap tabular-nums',
                  order.status !== 'paid' &&
                    order.status !== 'pending' &&
                    'text-muted-foreground line-through',
                )}
              >
                {formatEuro(order.price)}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{order.id}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

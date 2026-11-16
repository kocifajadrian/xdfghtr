import { useRef } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useOrderFormat } from './format'
import { StatusBadge } from './OrderStatus'
import type { Order } from './types'

/** A paid (or later refunded) order has a receipt. */
const hasReceipt = (order: Order) => order.status === 'paid' || order.status === 'refunded'

/**
 * The detail of one order in a popup: what it was, the price, how it was paid and its items. Open while `order` is set.
 * The download button is only a placeholder for now: it does not download anything until the API sends the receipt.
 */
export function OrderDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  // While the popup fades out `order` is already empty, so the last order stays on screen until it is gone.
  const last = useRef<Order | null>(null)
  if (order) last.current = order
  const shown = order ?? last.current

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">
        {shown && <Content key={shown.id} order={shown} />}
      </DialogContent>
    </Dialog>
  )
}

function Content({ order }: { order: Order }) {
  const { t, formatEuro } = useI18n()
  const { date } = useOrderFormat()

  const rows: [string, string][] = [
    [t('orders.number'), order.id],
    [t('orders.created'), date(order.createdAt)],
    [t('orders.payment'), t(`orders.payment.${order.payment}`)],
    ...(order.card ? ([[t('orders.card'), order.card]] as [string, string][]) : []),
  ]
  const unpaid = order.status !== 'paid' && order.status !== 'pending'

  return (
    <>
      <DialogHeader className="gap-1.5 pr-6">
        <div>
          <StatusBadge status={order.status} />
        </div>
        <DialogTitle className="text-base">{t(`orders.product.${order.product}`)}</DialogTitle>
        <DialogDescription>{order.description}</DialogDescription>
      </DialogHeader>

      <div className="bg-muted/50 rounded-lg px-4 py-3 text-center">
        <p className="text-muted-foreground text-xs">{t('orders.price')}</p>
        <p
          className={cn(
            'text-2xl font-semibold tabular-nums',
            unpaid && 'text-muted-foreground line-through',
          )}
        >
          {formatEuro(order.price)}
        </p>
      </div>

      <dl className="grid gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <Separator />

      <div className="grid gap-1.5 text-sm">
        <p className="text-muted-foreground text-xs font-medium">{t('orders.items')}</p>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-3">
            <span>
              {item.qty > 1 && <span className="text-muted-foreground">{item.qty} × </span>}
              {item.name}
            </span>
            <span className="tabular-nums">{formatEuro(item.qty * item.price)}</span>
          </div>
        ))}
      </div>

      {hasReceipt(order) && (
        <DialogFooter>
          {/* Placeholder: no file yet. */}
          <Button type="button" variant="outline" className="w-full sm:w-auto">
            <Download />
            {t('orders.receipt')}
          </Button>
        </DialogFooter>
      )}
    </>
  )
}

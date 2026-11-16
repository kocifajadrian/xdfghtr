import { useEffect, useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/config/navigation'
import { listOrders } from '@/features/orders/api'
import { filterOrders, NO_FILTER, orderYears, type OrderFilter } from '@/features/orders/filter'
import { OrderDialog } from '@/features/orders/OrderDialog'
import { OrderFilters } from '@/features/orders/OrderFilters'
import { OrderList } from '@/features/orders/OrderList'
import { OrderTable } from '@/features/orders/OrderTable'
import { DEFAULT_SORT, nextSort, sortOrders, type Sort } from '@/features/orders/sort'
import type { Order } from '@/features/orders/types'
import { useI18n } from '@/i18n'
import { useMediaQuery } from '@/lib/use-media-query'

/**
 * Orders of the signed-in user: filters on top, then a table (cards on phones) that scrolls down to the end of the page.
 * A row opens the detail of the order in a popup.
 */
export default function OrdersPage() {
  const { t } = useI18n()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<OrderFilter>(NO_FILTER)
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    listOrders().then(
      (result) => current && setOrders(result),
      () => current && setFailed(true),
    )
    return () => {
      current = false
    }
  }, [])

  const years = useMemo(() => (orders ? orderYears(orders) : []), [orders])
  const visible = useMemo(
    () =>
      orders
        ? sortOrders(
            filterOrders(orders, filter, (o) => t(`orders.product.${o.product}`)),
            sort,
          )
        : [],
    [orders, filter, sort, t],
  )
  const selected = orders?.find((o) => o.id === selectedId) ?? null

  const body = failed ? (
    <p className="text-destructive p-4 text-sm">{t('orders.loadFailed')}</p>
  ) : orders === null ? (
    <div className="flex justify-center p-10">
      <Spinner />
    </div>
  ) : orders.length === 0 ? (
    <p className="text-muted-foreground p-4 text-sm">{t('orders.none')}</p>
  ) : visible.length === 0 && isPhone ? (
    <Empty className="p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle className="text-base">{t('orders.noMatch')}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  ) : isPhone ? (
    <div className="p-3">
      <OrderList orders={visible} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  ) : (
    <OrderTable
      orders={visible}
      selectedId={selectedId}
      onSelect={setSelectedId}
      sort={sort}
      onSort={(key) => setSort((current) => nextSort(current, key))}
    />
  )

  return (
    <PageLayout className="flex flex-col">
      {/* The page is as high as the screen: the orders scroll inside their card, the filters stay in view. */}
      <div className="mx-auto flex h-[calc(100svh-2.75rem)] w-full max-w-[1000px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
          <PageBreadcrumb
            items={[
              { label: t('nav.home'), to: ROUTES.home },
              { label: t('breadcrumb.profile') },
              { label: t('orders.title') },
            ]}
          />
          <h1 className="sr-only">{t('orders.title')}</h1>

          <OrderFilters
            filter={filter}
            onChange={setFilter}
            years={years}
            shown={visible.length}
            total={orders?.length ?? 0}
          />
          <Card className="min-h-0 flex-1 gap-0 overflow-hidden py-0">
            <div className="min-h-0 flex-1 overflow-auto">{body}</div>
          </Card>
        </div>
      </div>

      {/* The detail of the chosen order, as a popup. */}
      <OrderDialog order={selected} onClose={() => setSelectedId(null)} />
    </PageLayout>
  )
}

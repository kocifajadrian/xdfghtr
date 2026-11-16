import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n'
import { Option, Select } from './fields'
import { isFiltering, NO_FILTER, type OrderFilter, type Period } from './filter'

const PERIODS = ['all', '30d', '90d', '12m'] as const

export function OrderFilters({
  filter,
  onChange,
  years,
  shown,
  total,
}: {
  filter: OrderFilter
  onChange: (next: OrderFilter) => void
  /** The years that have an order, for the period list. */
  years: string[]
  /** How many orders match the filter, out of all `total`. */
  shown: number
  total: number
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 basis-56">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            className="pl-8"
            value={filter.query}
            placeholder={t('orders.filter.search')}
            aria-label={t('orders.filter.search')}
            onChange={(e) => onChange({ ...filter, query: e.target.value })}
          />
        </div>

        <Select
          aria-label={t('orders.filter.period')}
          value={filter.period}
          onChange={(e) => onChange({ ...filter, period: e.target.value as Period })}
        >
          {PERIODS.map((p) => (
            <Option key={p} value={p}>
              {t(`orders.period.${p}`)}
            </Option>
          ))}
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>

        {isFiltering(filter) && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(NO_FILTER)}>
            <X />
            {t('orders.filter.reset')}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs" aria-live="polite">
        {total > 0 && t('orders.count', { shown, total })}
      </p>
    </div>
  )
}

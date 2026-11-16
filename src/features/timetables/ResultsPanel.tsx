import { ChevronDown, ChevronUp, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n'
import { ConnectionCard } from './ConnectionCard'
import type { Connection } from './types'

export function ResultsPanel({
  connections,
  selectedId,
  onSelect,
  onEarlier,
  onLater,
  loadingMore = null,
}: {
  connections: Connection[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Loads earlier / later connections. Missing = there are no more to load, so the button is disabled. */
  onEarlier?: () => void
  onLater?: () => void
  /** The button that is waiting for its connections shows a spinner; both are off meanwhile. */
  loadingMore?: 'earlier' | 'later' | null
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-3">
      {connections.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!onEarlier || loadingMore !== null}
            onClick={onEarlier}
          >
            {loadingMore === 'earlier' ? <Spinner /> : <ChevronUp />}
            {t('tt.earlier')}
          </Button>
        </div>
      )}

      {connections.length === 0 ? (
        <Empty className="p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle className="text-base">{t('tt.none')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup className="gap-2">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              selected={connection.id === selectedId}
              onSelect={() => onSelect(connection.id)}
            />
          ))}
        </ItemGroup>
      )}

      {connections.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!onLater || loadingMore !== null}
            onClick={onLater}
          >
            {loadingMore === 'later' ? <Spinner /> : <ChevronDown />}
            {t('tt.later')}
          </Button>
        </div>
      )}
    </div>
  )
}

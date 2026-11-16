import { useState, type FormEvent } from 'react'
import { ArrowUpDown, ChevronRight, Search, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/i18n'
import { readRecent, rememberSearch, type RecentSearch } from './recent'
import { StopCombobox } from './StopCombobox'
import { TransportTypePicker } from './TransportTypePicker'
import type { SearchQuery } from './types'
import { WhenPicker } from './WhenPicker'

// The "Recent searches" list is hidden for now. Set to true to show it again.
const SHOW_RECENT = false

export function SearchForm({
  query,
  loading,
  onSearch,
  onAskAi,
}: {
  query: SearchQuery
  loading: boolean
  onSearch: (query: SearchQuery) => void
  /** Opens the AI chat instead of the form. The AI row is only shown when this is given. */
  onAskAi?: () => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(query)
  const [recent, setRecent] = useState<RecentSearch[]>(readRecent)

  // The Search button stays disabled until both stops are picked and they differ.
  const canSearch =
    draft.from.trim() !== '' &&
    draft.to.trim() !== '' &&
    draft.from.trim().toLowerCase() !== draft.to.trim().toLowerCase()

  const patch = (changes: Partial<SearchQuery>) => {
    setDraft((d) => ({ ...d, ...changes }))
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const from = draft.from.trim()
    const to = draft.to.trim()
    if (!canSearch) return
    setRecent(rememberSearch({ from, to }))
    onSearch({ ...draft, from, to })
  }

  function searchRecent(item: RecentSearch) {
    const next = { ...draft, ...item }
    setDraft(next)
    setRecent(rememberSearch(item))
    onSearch(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
        {/* Transport type and time side by side, above the start field. */}
        <div className="grid grid-cols-2 gap-2">
          <TransportTypePicker value={draft.filter} onChange={(filter) => patch({ filter })} />
          <WhenPicker value={draft.when} onChange={(when) => patch({ when })} />
        </div>

        {/* From and To stacked, with a small round swap button between them on the right. */}
        <div className="relative">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 [&_[role=combobox]]:pr-11">
            <StopCombobox
              value={draft.from}
              onChange={(from) => patch({ from })}
              placeholder={t('tt.fromPlaceholder')}
              searchPlaceholder={t('tt.fromPlaceholder')}
              label={t('tt.from')}
            />
            <StopCombobox
              value={draft.to}
              onChange={(to) => patch({ to })}
              placeholder={t('tt.toPlaceholder')}
              searchPlaceholder={t('tt.toPlaceholder')}
              label={t('tt.to')}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-label={t('tt.swap')}
            onClick={() => patch({ from: draft.to, to: draft.from })}
            className="bg-background absolute inset-y-0 right-2 z-10 my-auto size-8 rounded-full active:translate-y-0!"
          >
            <ArrowUpDown />
          </Button>
        </div>

        <Field orientation="horizontal" className="h-9 items-center gap-2.5">
          <Switch
            id="tt-direct"
            checked={draft.directOnly}
            onCheckedChange={(directOnly) => patch({ directOnly })}
          />
          <FieldLabel htmlFor="tt-direct" className="flex-none! text-sm font-normal">
            {t('tt.direct')}
          </FieldLabel>
        </Field>

        <Button type="submit" disabled={loading || !canSearch} className="w-full">
          {loading ? <Spinner /> : <Search />}
          {loading ? t('tt.loading') : t('tt.search')}
        </Button>
      </form>

      {/* Another way in: ask the AI assistant in a chat. Hidden unless onAskAi is given. */}
      {onAskAi && (
        <Item variant="outline" size="sm" asChild className="hover:bg-accent">
          <button type="button" onClick={onAskAi}>
            <Sparkles className="size-4" aria-hidden="true" />
            <ItemContent>
              <ItemTitle>{t('tt.ai.entry')}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Badge variant="secondary">{t('tt.ai.beta')}</Badge>
              <ChevronRight className="text-muted-foreground size-4" />
            </ItemActions>
          </button>
        </Item>
      )}

      {SHOW_RECENT && recent.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">{t('tt.recent')}</p>
            <ItemGroup>
              {recent.map((item) => (
                <Item key={`${item.from}>${item.to}`} size="xs" asChild className="hover:bg-accent">
                  <button type="button" onClick={() => searchRecent(item)}>
                    <ItemContent>
                      <ItemTitle className="truncate">
                        {item.from} → {item.to}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRight className="text-muted-foreground size-4" />
                    </ItemActions>
                  </button>
                </Item>
              ))}
            </ItemGroup>
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageLayout } from '@/components/layout/PageLayout'
import { searchConnections } from '@/features/timetables/api'
import { shiftConnection } from '@/features/timetables/demo-journeys'
import { toMinutes } from '@/features/timetables/time'
import { DetailPanel } from '@/features/timetables/DetailPanel'
import { MapPreview } from '@/features/timetables/MapPreview'
import { ResultsPanel } from '@/features/timetables/ResultsPanel'
import { SearchForm } from '@/features/timetables/SearchForm'
import { AiChatPanel } from '@/features/timetables/AiChatPanel'
import type { ChatMessage } from '@/features/timetables/assistant'
import { EMPTY_QUERY, type Connection, type SearchQuery } from '@/features/timetables/types'
import { useI18n } from '@/i18n'
import { useMediaQuery } from '@/lib/use-media-query'

type View = 'search' | 'detail' | 'chat'

// On phones the panel is a bottom sheet. Heights are shares of the screen: low, middle, high.
// The demo makes more connections for "Load previous" and "Load more" by moving the found ones in time. One page is as long as the found connections are spread over, plus an hour, so the pages do not overlap.
const MAX_EARLIER_PAGES = 2
const MAX_LATER_PAGES = 4

const SNAP_POINTS = [0.25, 0.7, 0.9]
const SNAP_FOR_VIEW: Record<View, number> = { search: 0.7, detail: 0.9, chat: 0.9 }

/**
 * Journey planner: a map that fills the page and a panel on top of it that shows the search with its results under it and
 * moves to the detail of one connection. On desktop the panel is a small card in the corner, on phones a bottom sheet.
 */
export default function TimetablesPage() {
  const { t } = useI18n()
  const isPhone = useMediaQuery('(max-width: 639px)')
  const [view, setView] = useState<View>('search')
  const [snap, setSnap] = useState<number | string | null>(SNAP_FOR_VIEW.search)
  // The home page can send a whole search: it is filled in and run at once.
  const sent = (useLocation().state ?? null) as { query?: SearchQuery } | null
  const [query, setQuery] = useState<SearchQuery>(() => sent?.query ?? EMPTY_QUERY)
  const [loading, setLoading] = useState(false)
  // Whether a search was made, so the results (or "nothing found") are shown under the form.
  const [searched, setSearched] = useState(false)
  // The connections the search found, and how many extra pages were loaded before and after them.
  const [found, setFound] = useState<Connection[]>([])
  const [earlierPages, setEarlierPages] = useState(0)
  const [laterPages, setLaterPages] = useState(0)
  // Which of the two "load" buttons is waiting for its connections (the demo fakes a short wait).
  const [loadingMore, setLoadingMore] = useState<'earlier' | 'later' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeLeg, setActiveLeg] = useState<number | null>(null)
  // The AI chat is kept here, so going back to the search and returning does not lose the conversation.
  const [chat, setChat] = useState<ChatMessage[]>([])
  // Only the newest search may update the screen when several are started quickly.
  const searchId = useRef(0)

  useEffect(() => {
    if (sent?.query) void search(sent.query)
    // Only once, when the page opens with a search from the home page.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connections = useMemo(() => {
    const departures = found.map((c) => toMinutes(c.legs[0].stops[0].time))
    const pageMinutes = departures.length ? Math.max(...departures) - Math.min(...departures) + 60 : 120
    const pages: Connection[] = []
    for (let k = earlierPages; k >= 1; k--)
      pages.push(...found.map((c) => shiftConnection(c, -k * pageMinutes, `e${k}`)))
    pages.push(...found)
    for (let k = 1; k <= laterPages; k++)
      pages.push(...found.map((c) => shiftConnection(c, k * pageMinutes, `l${k}`)))
    // In the order of departure.
    return pages.sort((a, b) => a.inMin - b.inMin)
  }, [found, earlierPages, laterPages])

  const selected = connections.find((c) => c.id === selectedId)
  const snapShare = typeof snap === 'number' ? snap : SNAP_FOR_VIEW[view]

  function goTo(next: View) {
    setView(next)
    setSnap(SNAP_FOR_VIEW[next])
  }

  async function loadMore(direction: 'earlier' | 'later') {
    if (loadingMore) return
    setLoadingMore(direction)
    await new Promise((resolve) => setTimeout(resolve, 700))
    if (direction === 'earlier') setEarlierPages((n) => n + 1)
    else setLaterPages((n) => n + 1)
    setLoadingMore(null)
  }
  async function search(next: SearchQuery) {
    const id = ++searchId.current
    setQuery(next)
    setLoading(true)
    try {
      const result = await searchConnections(next)
      if (id !== searchId.current) return
      setFound(result)
      setEarlierPages(0)
      setLaterPages(0)
      setSelectedId(result[0]?.id ?? null)
      setLoadingMore(null)
      setActiveLeg(null)
      setSearched(true)
      // The results appear under the search form, in the same panel. On phones the sheet opens higher to show them.
      setView('search')
      setSnap(0.9)
    } finally {
      if (id === searchId.current) setLoading(false)
    }
  }

  const panel = (
    <>
      {/* The AI entry is hidden for now. To bring it back, pass onAskAi={() => goTo('chat')}. */}
      {view === 'search' && (
        <div className="flex flex-col gap-3">
          <SearchForm query={query} loading={loading} onSearch={search} />
          {searched && (
            <ResultsPanel
              connections={connections}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                goTo('detail')
              }}
              onEarlier={
                found.length > 0 && earlierPages < MAX_EARLIER_PAGES ? () => loadMore('earlier') : undefined
              }
              onLater={found.length > 0 && laterPages < MAX_LATER_PAGES ? () => loadMore('later') : undefined}
              loadingMore={loadingMore}
            />
          )}
        </div>
      )}
      {view === 'chat' && (
        <AiChatPanel
          messages={chat}
          onMessages={setChat}
          onBack={() => goTo('search')}
          onShowSearch={(found) => search({ ...query, from: found.from, to: found.to })}
        />
      )}
      {view === 'detail' && selected && (
        <DetailPanel
          connection={selected}
          activeLeg={activeLeg}
          onActiveLeg={setActiveLeg}
          onBack={() => {
            setActiveLeg(null)
            goTo('search')
          }}
        />
      )}
    </>
  )

  return (
    <PageLayout className="flex flex-col">
      {/* The map fills the centred column (same width as the header). The panel floats on top of it. */}
      <div className="mx-auto w-full max-w-[1000px] flex-1">
        <div className="relative h-[calc(100svh-2.75rem)] overflow-hidden">
          <MapPreview
            connection={view === 'chat' || (view === 'search' && !searched) ? undefined : selected}
            activeLeg={view === 'detail' ? activeLeg : null}
            // Phones: keep the route above the sheet.
            insetBottom={isPhone ? snapShare * window.innerHeight : 0}
            className="absolute inset-0"
          />
          <h1 className="sr-only">{t('nav.timetables')}</h1>

          {!isPhone && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start p-3">
              <Card className="pointer-events-auto w-[330px] gap-0 overflow-hidden py-0 shadow-lg">
                <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-[calc(100svh-2.75rem-1.5rem)]">
                  <div className="p-3">{panel}</div>
                </ScrollArea>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Not modal and not closable: it is a permanent sheet, the map behind it stays usable. */}
      {isPhone && (
        <Drawer
          open
          modal={false}
          dismissible={false}
          snapPoints={SNAP_POINTS}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          <DrawerContent className="h-[90dvh] max-h-none" aria-describedby={undefined}>
            <DrawerTitle className="sr-only">{t('nav.timetables')}</DrawerTitle>
            <div
              className="overflow-y-auto px-3 pt-3 pb-6"
              style={{ maxHeight: `calc(${snapShare} * 100dvh - 2.5rem)` }}
            >
              {panel}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </PageLayout>
  )
}

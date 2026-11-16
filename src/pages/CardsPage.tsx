import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb'
import { PageLayout } from '@/components/layout/PageLayout'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/config/navigation'
import { listCards } from '@/features/cards/api'
import { CardDetail } from '@/features/cards/CardDetail'
import { CardPicker } from '@/features/cards/CardPicker'
import type { TransportCard } from '@/features/cards/types'
import { useI18n } from '@/i18n'

/**
 * The transport cards of the signed-in user. A drop-down on top picks the card, the first one is chosen at the start,
 * and its detail with everything that can be done is right below. The chosen card is kept in the address (?karta=).
 */
export default function CardsPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const [cards, setCards] = useState<TransportCard[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let current = true
    listCards().then(
      (result) => current && setCards(result),
      () => current && setFailed(true),
    )
    return () => {
      current = false
    }
  }, [])

  const selected = cards?.find((c) => c.id === params.get('karta')) ?? cards?.[0]
  const select = (id: string) => setParams({ karta: id }, { replace: true })
  const replace = (card: TransportCard) =>
    setCards((list) => list && list.map((c) => (c.id === card.id ? card : c)))
  const remove = (id: string) => {
    setCards((list) => list && list.filter((c) => c.id !== id))
    setParams({}, { replace: true })
  }

  return (
    <PageLayout>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-3 p-3 sm:p-4">
        <PageBreadcrumb items={[{ label: t('nav.home'), to: ROUTES.home }, { label: t('nav.card') }]} />
        <h1 className="sr-only">{t('cards.title')}</h1>

        {failed ? (
          <p className="text-destructive text-sm">{t('cards.loadFailed')}</p>
        ) : cards === null ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : !selected ? (
          <Empty className="rounded-xl border border-dashed p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CreditCard />
              </EmptyMedia>
              <EmptyTitle>{t('cards.empty.title')}</EmptyTitle>
              <EmptyDescription>{t('cards.empty.text')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <CardPicker cards={cards} selectedId={selected.id} onSelect={select} />
            <CardDetail key={selected.id} card={selected} onChange={replace} onRemoved={remove} />
          </>
        )}
      </div>
    </PageLayout>
  )
}

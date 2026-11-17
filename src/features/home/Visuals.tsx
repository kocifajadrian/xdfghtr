import { CardVisual as TransportCardVisual } from '@/features/cards/CardVisual'
import { initialCards } from '@/features/cards/mock-data'

// Illustrations for the home page sections. The card shows the same data as the real card, so its labels are
// translated; the other pictures only contain numbers, names and symbols.

/** A transport card, tilted, that floats gently. It looks like the cards in "Transport cards". */
export function CardVisual() {
  // The picture shows a made-up student card: card valid until 31. 12. 2031, the discount until 30. 9. 2027.
  const demo = {
    ...initialCards()[0]!,
    number: '6162481920351174',
    kind: 'student' as const,
    validUntil: '2031-12-31',
    discountUntil: '2027-09-30',
  }
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="float-slow rotate-3 rounded-2xl shadow-xl">
        <TransportCardVisual card={demo} />
      </div>
    </div>
  )
}

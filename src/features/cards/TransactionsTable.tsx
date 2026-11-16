import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/i18n'
import { listTransactions } from './api'
import { useCardFormat } from './format'
import type { CardTransaction } from './types'

/** The payments made with the card while travelling (in a bus, a train): when, which line, where and how much. */
export function TransactionsTable({ cardId }: { cardId: string }) {
  const { t, formatEuro } = useI18n()
  const { dateTime } = useCardFormat()
  const [rides, setRides] = useState<CardTransaction[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let current = true
    listTransactions(cardId).then(
      (result) => current && setRides(result),
      () => current && setFailed(true),
    )
    return () => {
      current = false
    }
  }, [cardId])

  if (failed) return <p className="text-destructive px-4 text-sm">{t('cards.error')}</p>
  if (rides === null) {
    return (
      <div className="flex justify-center p-6">
        <Spinner />
      </div>
    )
  }
  if (rides.length === 0) return <p className="text-muted-foreground px-4 text-sm">{t('cards.tx.none')}</p>

  return (
    // The table scrolls inside its card, so a long history does not push the page down.
    <div className="max-h-72 overflow-auto">
      <Table>
        <TableHeader className="bg-card sticky top-0 z-10">
          <TableRow>
            <TableHead className="pl-4">{t('cards.tx.when')}</TableHead>
            <TableHead>{t('cards.tx.line')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('cards.tx.route')}</TableHead>
            <TableHead className="pr-4 text-right">{t('cards.tx.amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rides.map((ride) => (
            <TableRow key={ride.id}>
              <TableCell className="pl-4 whitespace-nowrap tabular-nums">{dateTime(ride.at)}</TableCell>
              <TableCell className="whitespace-nowrap">{ride.line}</TableCell>
              <TableCell className="text-muted-foreground hidden sm:table-cell">{ride.route}</TableCell>
              <TableCell className="pr-4 text-right tabular-nums">{formatEuro(ride.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

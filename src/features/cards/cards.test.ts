import { beforeEach, describe, expect, it } from 'vitest'
import {
  blockCard,
  buyTicket,
  CardError,
  getCard,
  listCards,
  listTransactions,
  orderDuplicate,
  registerCard,
  removeCard,
  resetMockCards,
  topUpCredit,
} from './api'
import { formatCardNumber, isCardNumber, parseCardNumber, ticketDaysLeft, ticketLeftShare } from './format'
import { dayFromToday } from './mock-data'

describe('card number', () => {
  it('is written in groups of four while typing', () => {
    expect(formatCardNumber('61627730')).toBe('6162 7730')
    expect(formatCardNumber('6162 7730 5827 7636 99')).toBe('6162 7730 5827 7636')
    expect(formatCardNumber('ab12')).toBe('12')
  })

  it('is read back as digits and checked for length', () => {
    expect(parseCardNumber('6162 7730 5827 7636')).toBe('6162773058277636')
    expect(isCardNumber('6162773058277636')).toBe(true)
    expect(isCardNumber('616277305827763')).toBe(false)
  })
})

describe('ticket time', () => {
  const ticket = (from: number, to: number) => ({
    name: 'PCL',
    from: dayFromToday(from),
    to: dayFromToday(to),
    zones: [],
  })

  it('counts today as a day left', () => {
    expect(ticketDaysLeft(ticket(-10, 0))).toBe(1)
    expect(ticketDaysLeft(ticket(-10, 35))).toBe(36)
  })

  it('is zero once the ticket is over', () => {
    expect(ticketDaysLeft(ticket(-20, -1))).toBe(0)
    expect(ticketLeftShare(ticket(-20, -1))).toBe(0)
  })

  it('gives the share of the ticket that is left', () => {
    expect(ticketLeftShare(ticket(0, 9))).toBe(1)
    expect(ticketLeftShare(ticket(-5, 4))).toBeCloseTo(0.5)
  })
})

describe('mock cards api', () => {
  beforeEach(() => resetMockCards())

  it('lists the cards and finds one by id', async () => {
    expect(await listCards()).toHaveLength(5)
    expect((await getCard('c1'))?.carrier).toBe('SAD Žilina')
    expect(await getCard('nope')).toBeNull()
  })

  it('registers a card by number and refuses one that is already there or unknown', async () => {
    const card = await registerCard('6162773000000001')
    expect(card.holder).toBeTruthy()
    expect(await listCards()).toHaveLength(6)

    await expect(registerCard('6162773000000001')).rejects.toMatchObject({ key: 'cards.add.exists' })
    await expect(registerCard('0000773000000002')).rejects.toBeInstanceOf(CardError)
  })

  it('tops up the credit', async () => {
    const card = await topUpCredit('c1', 10)
    expect(card.credit).toBe(14.92)
  })

  it('buys a ticket from the credit and refuses when the credit is short', async () => {
    await expect(buyTicket('c1', '30', 'credit')).rejects.toMatchObject({ key: 'cards.buy.short' })
    await topUpCredit('c1', 30)
    const card = await buyTicket('c1', '30', 'credit')
    expect(card.credit).toBe(10.92)
  }, 5000)

  it('does not touch the credit when the ticket is paid by card', async () => {
    const card = await buyTicket('c1', '365', 'googlePay')
    expect(card.credit).toBe(4.92)
  })

  it('extends a running ticket and starts a new one today', async () => {
    await topUpCredit('c1', 200)
    const before = (await getCard('c1'))!.ticket!
    const extended = await buyTicket('c1', '30', 'credit')
    expect(extended.ticket!.from).toBe(before.from)
    expect(extended.ticket!.to).toBe(dayFromToday(35 + 30))

    await topUpCredit('c2', 50)
    const started = await buyTicket('c2', '30', 'credit')
    expect(started.ticket!.from).toBe(dayFromToday(0))
    expect(started.ticket!.to).toBe(dayFromToday(29))
  }, 10000)

  it('lists the rides paid with a card, newest first', async () => {
    const rides = await listTransactions('c1')
    expect(rides.length).toBeGreaterThan(3)
    expect(rides.every((r) => r.amount < 0)).toBe(true)
    expect(rides.map((r) => r.at)).toEqual([...rides.map((r) => r.at)].sort().reverse())
    expect(await listTransactions('c3')).toEqual([])
  })

  it('blocks a card and then refuses to top it up', async () => {
    expect((await blockCard('c1')).status).toBe('blocked')
    await expect(topUpCredit('c1', 5)).rejects.toMatchObject({ key: 'cards.blockedNotice' })
  })

  it('orders a duplicate, which also blocks the card', async () => {
    const card = await orderDuplicate('c2')
    expect(card.status).toBe('blocked')
    expect(card.duplicateOrdered).toBe(true)
  })

  it('removes a card', async () => {
    await removeCard('c3')
    expect(await getCard('c3')).toBeNull()
  })
})

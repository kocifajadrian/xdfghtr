/**
 * The signed-in user's transport cards. With no API address configured it works on an in-memory list (mock-data.ts),
 * so every action in the demo really changes what the screens show, until the page is reloaded.
 * The real calls are not defined yet: when they are, replace the bodies and keep the signatures.
 */
import { env } from '@/config/env'
import type { MessageKey } from '@/i18n'
import { http } from '@/lib/http'
import {
  dayFromToday,
  initialCards,
  initialTransactions,
  NEW_CARD_PRICE,
  nowLocal,
  TICKET_OPTIONS,
  UNKNOWN_PREFIX,
} from './mock-data'
import type { CardTransaction, PaymentMethod, TransportCard } from './types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const round = (n: number) => Math.round(n * 100) / 100

/** A failure the person can read: `key` is the text to show. */
export class CardError extends Error {
  readonly key: MessageKey
  constructor(key: MessageKey) {
    super(key)
    this.key = key
  }
}

let cards: TransportCard[] = initialCards()
let transactions = initialTransactions()
let nextId = 10

/** Back to the starting cards. Used by tests. */
export function resetMockCards() {
  cards = initialCards()
  transactions = initialTransactions()
  nextId = 10
}

const copy = (card: TransportCard): TransportCard => ({
  ...card,
  ticket: card.ticket && { ...card.ticket },
})

function find(id: string): TransportCard {
  const card = cards.find((c) => c.id === id)
  if (!card) throw new CardError('cards.notFound')
  return card
}

/** Changes a card in the mock list and returns the new version. */
function change(id: string, apply: (card: TransportCard) => void): TransportCard {
  const card = find(id)
  apply(card)
  return copy(card)
}

export async function listCards(): Promise<TransportCard[]> {
  if (!env.useMockApi) return http<TransportCard[]>('/cards')
  await sleep(300)
  return cards.map(copy)
}

export async function getCard(id: string): Promise<TransportCard | null> {
  if (!env.useMockApi) return http<TransportCard>(`/cards/${id}`)
  await sleep(200)
  const card = cards.find((c) => c.id === id)
  return card ? copy(card) : null
}

/** Adds a card the person already owns, by its number. */
export async function registerCard(number: string): Promise<TransportCard> {
  if (!env.useMockApi) return http<TransportCard>('/cards', { method: 'POST', body: { number } })
  await sleep(500)
  if (cards.some((c) => c.number === number)) throw new CardError('cards.add.exists')
  if (number.startsWith(UNKNOWN_PREFIX)) throw new CardError('cards.add.unknown')
  const card: TransportCard = {
    id: `c${nextId++}`,
    number,
    holder: 'Adrián Kocifaj',
    carrier: 'SAD Žilina',
    kind: 'full',
    status: 'active',
    duplicateOrdered: false,
    credit: 0,
    creditAsOf: nowLocal(),
    validUntil: dayFromToday(365 * 5),
    discountUntil: null,
    ticket: null,
    greenKm: 0,
    co2Kg: 0,
  }
  cards.push(card)
  return copy(card)
}

/** Orders a new plastic card. It shows up in the orders and, once it is delivered, can be added with its number. */
export async function orderNewCard(): Promise<{ price: number }> {
  if (!env.useMockApi) return http<{ price: number }>('/cards/orders', { method: 'POST' })
  await sleep(600)
  return { price: NEW_CARD_PRICE }
}

export async function removeCard(id: string): Promise<void> {
  if (!env.useMockApi) return http<void>(`/cards/${id}`, { method: 'DELETE' })
  await sleep(300)
  find(id)
  cards = cards.filter((c) => c.id !== id)
}

export async function blockCard(id: string): Promise<TransportCard> {
  if (!env.useMockApi) return http<TransportCard>(`/cards/${id}/block`, { method: 'POST' })
  await sleep(400)
  return change(id, (c) => void (c.status = 'blocked'))
}

/** Orders a duplicate. The old card is blocked at the same time. */
export async function orderDuplicate(id: string): Promise<TransportCard> {
  if (!env.useMockApi) return http<TransportCard>(`/cards/${id}/duplicate`, { method: 'POST' })
  await sleep(500)
  return change(id, (c) => {
    c.status = 'blocked'
    c.duplicateOrdered = true
  })
}

export async function topUpCredit(
  id: string,
  amount: number,
  payment: PaymentMethod = 'card',
): Promise<TransportCard> {
  if (!env.useMockApi)
    return http<TransportCard>(`/cards/${id}/top-up`, { method: 'POST', body: { amount, payment } })
  await sleep(700)
  return change(id, (c) => {
    if (c.status === 'blocked') throw new CardError('cards.blockedNotice')
    c.credit = round(c.credit + amount)
    c.creditAsOf = nowLocal()
  })
}

/** The payments made with the card while travelling, newest first. */
export async function listTransactions(id: string): Promise<CardTransaction[]> {
  if (!env.useMockApi) return http<CardTransaction[]>(`/cards/${id}/transactions`)
  await sleep(300)
  find(id)
  return (transactions[id] ?? []).map((t) => ({ ...t }))
}

/** Buys a time ticket. A ticket that is still valid is extended, a new one starts today. */
export async function buyTicket(
  id: string,
  optionId: string,
  payment: PaymentMethod,
): Promise<TransportCard> {
  if (!env.useMockApi) {
    return http<TransportCard>(`/cards/${id}/tickets`, {
      method: 'POST',
      body: { option: optionId, payment },
    })
  }
  await sleep(700)
  const option = TICKET_OPTIONS.find((o) => o.id === optionId)
  if (!option) throw new CardError('cards.buy.failed')
  return change(id, (c) => {
    if (c.status === 'blocked') throw new CardError('cards.blockedNotice')
    // Only a payment from the credit touches the credit. A card or Google Pay is paid at the bank.
    if (payment === 'credit') {
      if (c.credit < option.price) throw new CardError('cards.buy.short')
      c.credit = round(c.credit - option.price)
    }

    const today = dayFromToday(0)
    const current = c.ticket && c.ticket.to >= today ? c.ticket : null
    // A running ticket gets the days added to its end, a new one covers today and the days after.
    const end = new Date(`${current ? current.to : today}T00:00:00`)
    end.setDate(end.getDate() + (current ? option.days : option.days - 1))
    const pad = (n: number) => String(n).padStart(2, '0')
    c.ticket = {
      name: `PCL ${option.days} dní`,
      from: current ? current.from : today,
      to: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
      zones: c.ticket?.zones ?? ['IDS PLUS', '99'],
    }
  })
}

import { useCallback } from 'react'
import { useI18n } from '@/i18n'
import { getLanguage } from '@/i18n/languages'
import type { CardTicket } from './types'

/** "6162773058277636" -> "6162 7730 5827 7636". Also formats a number that is still being typed. */
export function formatCardNumber(value: string): string {
  return (
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .match(/.{1,4}/g) ?? []
  ).join(' ')
}

/** "6162 7730 5827 7636" -> "6162773058277636". */
export function parseCardNumber(value: string): string {
  return value.replace(/\D/g, '')
}

export const MIN_TOP_UP = 1
export const MAX_TOP_UP = 200

/** The amount a person typed ("12,5" or "12.5"), or null when it is not a usable amount. */
export function parseAmount(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'))
  if (!Number.isFinite(value) || value < MIN_TOP_UP || value > MAX_TOP_UP) return null
  return Math.round(value * 100) / 100
}

export const isCardNumber = (digits: string) => /^\d{16}$/.test(digits)

/** "•••• 7636", for places where the whole number is not needed. */
export const lastDigits = (number: string) => `•••• ${number.slice(-4)}`

const DAY = 24 * 60 * 60 * 1000
const localDay = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`)

/** Days from today to the end of the ticket, today included. 0 = expired. */
export function ticketDaysLeft(ticket: CardTicket, today = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.max(0, Math.round((localDay(ticket.to).getTime() - start.getTime()) / DAY) + 1)
}

/** How much of the ticket is still left, 0 to 1. */
export function ticketLeftShare(ticket: CardTicket, today = new Date()): number {
  const total = Math.round((localDay(ticket.to).getTime() - localDay(ticket.from).getTime()) / DAY) + 1
  return total <= 0 ? 0 : Math.min(1, ticketDaysLeft(ticket, today) / total)
}

/** Dates and amounts of cards in the language of the page. */
export function useCardFormat() {
  const { language } = useI18n()
  const locale = getLanguage(language).locale
  const date = useCallback(
    (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(localDay(iso)),
    [locale],
  )
  const dateTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)),
    [locale],
  )
  const km = useCallback(
    (value: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} km`,
    [locale],
  )
  const kg = useCallback(
    (value: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} kg`,
    [locale],
  )
  return { date, dateTime, km, kg }
}

/**
 * Journey search. With no API address configured it returns MOCK data (a few ready-made journeys, see
 * demo-journeys.ts, and nothing for other stops) so the screens work without a backend. The real call is not
 * defined yet: when it is, replace the body of searchConnections and keep the signature.
 */
import { env } from '@/config/env'
import { http } from '@/lib/http'
import { findConnections } from './demo-journeys'
import { transfers } from './time'
import type { Connection, SearchQuery } from './types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Lower case without accents, so the stop names compare loosely. */
const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

/** A stop counts as its town: "Žilina, žel. st." is Žilina. */
const town = (name: string) => plain(name.split(',')[0])

async function mockSearch(query: SearchQuery): Promise<Connection[]> {
  await sleep(500)
  const found = findConnections(query.from, query.to, (a, b) => town(a) === town(b))
  return found.filter((connection) => {
    if (query.directOnly && transfers(connection) > 0) return false
    return connection.legs.every((leg) => leg.kind === 'walk' || query.filter.modes.includes(leg.mode))
  })
}

export async function searchConnections(query: SearchQuery): Promise<Connection[]> {
  if (env.useMockApi) return mockSearch(query)
  return http<Connection[]>('/connections/search', { method: 'POST', body: query })
}

/**
 * The AI assistant. With no API address configured it is a MOCK: it only looks for two known stops in the message
 * ("from Košice to Prešov") and offers that search. The real call is not defined yet: when it is, replace the body
 * of askAssistant and keep the signature. The answer carries the text to show and, when the assistant found a
 * journey, the search to run.
 */
import { env } from '@/config/env'
import { http } from '@/lib/http'
import { STOP_SUGGESTIONS } from './mock-data'
import { plain } from './StopCombobox'

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
  /** A search the assistant found. The chat shows a button that runs it. */
  search?: { from: string; to: string }
}

export type AssistantAnswer = {
  /** Text to show. Null means the app writes its own default text (the mock does this, so it is translated). */
  text: string | null
  search?: { from: string; to: string }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockAnswer(history: ChatMessage[]): Promise<AssistantAnswer> {
  await sleep(700)
  const last = plain(history[history.length - 1]?.text ?? '')
  // Known stops in the order they are written: the first is the start, the second the destination.
  const found = STOP_SUGGESTIONS.map((name) => ({ name, at: last.indexOf(plain(name).slice(0, 5)) }))
    .filter((stop) => stop.at >= 0)
    .sort((a, b) => a.at - b.at)
  if (found.length >= 2) return { text: null, search: { from: found[0].name, to: found[1].name } }
  return { text: null }
}

export async function askAssistant(history: ChatMessage[]): Promise<AssistantAnswer> {
  if (env.useMockApi) return mockAnswer(history)
  return http<AssistantAnswer>('/assistant', { method: 'POST', body: { messages: history } })
}

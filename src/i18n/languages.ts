import { de } from './messages/de'
import { en } from './messages/en'
import { hu } from './messages/hu'
import { pl } from './messages/pl'
import { sk } from './messages/sk'
import type { Messages } from './messages/types'
import { uk } from './messages/uk'

export const LANGUAGES = [
  // `name` is always written in the language itself, so a visitor can find theirs in any language.
  { code: 'sk', name: 'Slovenčina', short: 'SK', locale: 'sk-SK', messages: sk, enabled: true },
  { code: 'en', name: 'English', short: 'EN', locale: 'en-GB', messages: en, enabled: true },
  { code: 'de', name: 'Deutsch', short: 'DE', locale: 'de-DE', messages: de, enabled: true },
  { code: 'pl', name: 'Polski', short: 'PL', locale: 'pl-PL', messages: pl, enabled: true },
  // Ukrainian is "uk" as a language code, but "UK" would read as United Kingdom, so the button shows UA.
  { code: 'uk', name: 'Українська', short: 'UA', locale: 'uk-UA', messages: uk, enabled: true },
  { code: 'hu', name: 'Magyar', short: 'HU', locale: 'hu-HU', messages: hu, enabled: true },
] as const satisfies readonly {
  code: string
  name: string
  short: string
  locale: string
  /** Only enabled languages can be chosen. Turn one on here when its translation is checked. */
  enabled: boolean
  messages: Messages
}[]

export type Language = (typeof LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: Language = 'sk'

/** True for a language we have AND have switched on. */
export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((l) => l.code === value && l.enabled)
}

export function getLanguage(code: Language) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}

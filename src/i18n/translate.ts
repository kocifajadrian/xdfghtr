import { DEFAULT_LANGUAGE, getLanguage, isLanguage, LANGUAGES, type Language } from './languages'
import type { MessageKey } from './messages/types'

export type Params = Record<string, string | number>

const STORAGE_KEY = 'ubian.lang'

/** Looks up a text and fills in {placeholders}. Plain function, so it also works outside React. */
export function translate(language: Language, key: MessageKey, params?: Params): string {
  const text: string = getLanguage(language).messages[key]
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}

export function readStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isLanguage(stored) ? stored : null
  } catch {
    return null // storage can be blocked (private windows)
  }
}

export function storeLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    /* ignore */
  }
}

/** The visitor's saved choice, else the first browser language we have, else Slovak. */
export function detectLanguage(): Language {
  const stored = readStoredLanguage()
  if (stored) return stored
  const preferred = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    const match = LANGUAGES.find((l) => l.code === base && l.enabled)
    if (match) return match.code
  }
  return DEFAULT_LANGUAGE
}

import { createContext } from 'react'
import type { Language } from './languages'
import type { MessageKey } from './messages/types'
import type { Params } from './translate'

export type I18nValue = {
  language: Language
  setLanguage: (language: Language) => void
  /** Text for a key in the current language. */
  t: (key: MessageKey, params?: Params) => string
  /** An amount in euro, written the way the current language does it (1,50 € or €1.50). */
  formatEuro: (amount: number) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

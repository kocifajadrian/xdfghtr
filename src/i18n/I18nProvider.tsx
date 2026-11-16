import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './i18n-context'
import { getLanguage, type Language } from './languages'
import { detectLanguage, storeLanguage, translate, type Params } from './translate'
import type { MessageKey } from './messages/types'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  const setLanguage = useCallback((next: Language) => {
    storeLanguage(next)
    setLanguageState(next)
  }, [])

  const t = useCallback((key: MessageKey, params?: Params) => translate(language, key, params), [language])

  const formatEuro = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(getLanguage(language).locale, { style: 'currency', currency: 'EUR' }).format(
        amount,
      ),
    [language],
  )

  // Keep <html lang> (screen readers, hyphenation, spell check) and the page description in step.
  useEffect(() => {
    document.documentElement.lang = language
    const description = translate(language, 'meta.description')
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, t, formatEuro }),
    [language, setLanguage, t, formatEuro],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

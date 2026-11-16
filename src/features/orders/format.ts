import { useCallback } from 'react'
import { useI18n } from '@/i18n'
import { getLanguage } from '@/i18n/languages'

/** Date and time of an order in the language of the page. */
export function useOrderFormat() {
  const { language } = useI18n()
  const date = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(getLanguage(language).locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso)),
    [language],
  )
  return { date }
}

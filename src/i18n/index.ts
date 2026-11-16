// Public API of the i18n module. Other parts of the app import from '@/i18n' only.
export { I18nProvider } from './I18nProvider'
export { useI18n } from './useI18n'
export { LANGUAGES, getLanguage, type Language } from './languages'
export { detectLanguage, translate } from './translate'
export type { MessageKey } from './messages/types'

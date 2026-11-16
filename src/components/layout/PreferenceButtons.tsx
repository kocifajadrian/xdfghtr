import { Flag } from '@/components/brand/Flag'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getLanguage, useI18n } from '@/i18n'
import { LanguageItems } from './PreferenceItems'
import { ThemeIcon, useThemeSwitch } from './ThemeSwitch'

// Icon buttons for signed-out visitors. Signed-in users find the same two choices in the account menu.

/** A switch between light and dark: one click flips it, the icon changes between sun and moon. */
export function ThemeButton() {
  const { dark, toggle } = useThemeSwitch()
  const { t } = useI18n()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? t('theme.toLight') : t('theme.toDark')}
    >
      <ThemeIcon className="size-[1.2rem]" />
    </Button>
  )
}

/** Shows the flag of the current language. Its menu lists all languages, each with its flag. */
export function LanguageButton() {
  const { language, t } = useI18n()
  const current = getLanguage(language)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label={`${t('language.label')}: ${current.name}`}>
          <Flag language={language} />
          {/* The code is hidden on very small screens to save room. */}
          <span className="hidden sm:inline">{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <LanguageItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

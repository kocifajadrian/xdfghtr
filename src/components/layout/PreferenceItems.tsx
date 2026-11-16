import { Flag } from '@/components/brand/Flag'
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu'
import { LANGUAGES, useI18n, type Language } from '@/i18n'

// The language choice. Each option starts with its flag, followed by the name in its own language.

export function LanguageItems() {
  const { language, setLanguage } = useI18n()
  return (
    <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
      {LANGUAGES.map((l) => (
        <DropdownMenuRadioItem
          key={l.code}
          value={l.code}
          lang={l.code}
          disabled={!l.enabled}
          className="pr-2 data-[state=checked]:font-medium [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden"
        >
          <Flag language={l.code} />
          {l.name}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

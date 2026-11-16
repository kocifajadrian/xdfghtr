import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { CITIES } from './mock-data'
import { MODE_LABEL, ModeDot } from './mode'
import { plain } from './StopCombobox'
import { ALL_MODES, type Mode, type TransportFilter } from './types'

export function useFilterLabel() {
  const { t } = useI18n()
  return (filter: TransportFilter) =>
    filter.city
      ? t('tt.type.cityValue', { city: filter.city })
      : filter.modes.length === ALL_MODES.length
        ? t('tt.type.all')
        : ALL_MODES.filter((m) => filter.modes.includes(m))
            .map((m) => t(MODE_LABEL[m]))
            .join(', ')
}

/**
 * Field that opens a popup to choose the transport type: any mix of trains, buses and city transit,
 * or only the city transit of one town. Every choice applies at once, there is no Apply button.
 */
export function TransportTypePicker({
  value,
  onChange,
}: {
  value: TransportFilter
  onChange: (value: TransportFilter) => void
}) {
  const { t } = useI18n()
  const label = useFilterLabel()
  const [open, setOpen] = useState(false)

  function toggleMode(mode: Mode) {
    // Picking a mode after a town leaves the town and starts again from that one mode.
    if (value.city) return onChange({ modes: [mode], city: null })
    const has = value.modes.includes(mode)
    // At least one mode stays selected.
    if (has && value.modes.length === 1) return
    onChange({ modes: has ? value.modes.filter((m) => m !== mode) : [...value.modes, mode], city: null })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between font-normal"
          aria-label={t('tt.type.label')}
        >
          <span className="truncate">{label(value)}</span>
          <ChevronDown className="text-muted-foreground size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 gap-3 p-3">
        <div className="grid gap-0.5">
          {ALL_MODES.map((mode) => {
            const id = `tt-mode-${mode}`
            return (
              <Label
                key={mode}
                htmlFor={id}
                className="hover:bg-accent cursor-pointer gap-2.5 rounded-md px-2 py-1.5 font-normal"
              >
                <Checkbox
                  id={id}
                  checked={!value.city && value.modes.includes(mode)}
                  onCheckedChange={() => toggleMode(mode)}
                />
                <ModeDot mode={mode} />
                {t(MODE_LABEL[mode])}
              </Label>
            )
          })}
        </div>

        <Separator />

        <Command
          className="rounded-md border"
          filter={(itemValue, search) => (plain(itemValue).includes(plain(search)) ? 1 : 0)}
        >
          <CommandInput placeholder={t('tt.type.citySearch')} />
          <CommandList className="max-h-40">
            <CommandEmpty>{t('tt.type.cityEmpty')}</CommandEmpty>
            <CommandGroup>
              {CITIES.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => {
                    onChange({ modes: ['mhd'], city: value.city === city ? null : city })
                    setOpen(false)
                  }}
                >
                  <ModeDot mode="mhd" />
                  {t('tt.type.cityValue', { city })}
                  {value.city === city && <Check className="ml-auto size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <Separator />

        {/* Changes apply at once; Apply only closes the popup, so people have something to click. */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ modes: ALL_MODES, city: null })}
          >
            {t('tt.type.reset')}
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            {t('tt.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

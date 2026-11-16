import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { de, enGB, hu, pl, sk, uk } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker, TimePickerColumns, TimePickerPanel } from '@/components/reui/time-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getLanguage, useI18n, type Language } from '@/i18n'

const CALENDAR_LOCALES: Record<Language, typeof sk> = { sk, en: enGB, pl, de, hu, uk }

const pad = (n: number) => String(n).padStart(2, '0')

/** "YYYY-MM-DD" for a date in local time. */
function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "HH:MM" for a date in local time. */
function toTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Splits "now" or "YYYY-MM-DDTHH:MM" into a date and a time. "now" gives today and the current time. */
function split(when: string): { date: string; time: string; now: boolean } {
  if (when === 'now') {
    const now = new Date()
    return { date: toDateString(now), time: toTimeString(now), now: true }
  }
  const [date, time] = when.split('T')
  return { date, time: time ?? '00:00', now: false }
}

/**
 * One button for when to leave: "Now" by default, or a date and time. It opens a calendar with a time field under it.
 * `value` is "now" or "YYYY-MM-DDTHH:MM" (local time).
 */
export function WhenPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t, language } = useI18n()
  const [open, setOpen] = useState(false)
  const { date, time, now } = split(value)
  const selected = new Date(`${date}T00:00:00`)

  // The date without the year, e.g. "20. nov., 08:15".
  const dayLabel = new Intl.DateTimeFormat(getLanguage(language).locale, {
    day: 'numeric',
    month: 'short',
  }).format(selected)
  const label = now ? t('tt.when.now') : `${dayLabel}, ${time}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={t('tt.when')}
          className="h-9 w-full justify-start font-normal"
        >
          <CalendarDays className="text-muted-foreground" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      {/* Calendar and the time lists side by side (stacked on narrow screens), scrolls if the screen is too short. */}
      <PopoverContent
        align="start"
        className="max-h-(--radix-popover-content-available-height) w-auto gap-0 overflow-y-auto p-0"
      >
        <div className="flex flex-col items-center gap-3 p-3 sm:flex-row sm:items-start">
          <Calendar
            mode="single"
            required
            locale={CALENDAR_LOCALES[language]}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => onChange(`${toDateString(day)}T${time}`)}
          />
          <div className="flex justify-center self-stretch max-sm:border-t max-sm:pt-3 sm:border-s sm:ps-3">
            <TimePicker
              aria-label={t('tt.time')}
              value={time}
              onValueChange={(next) => next && onChange(`${date}T${next}`)}
              minuteStep={5}
            >
              <TimePickerPanel className="[--time-picker-rows:7]">
                <TimePickerColumns />
              </TimePickerPanel>
            </TimePicker>
          </div>
        </div>
        {/* Changes apply at once; Apply only closes the popup, so people have something to click. */}
        <div className="bg-popover sticky bottom-0 flex items-center justify-end gap-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('now')
              setOpen(false)
            }}
          >
            {t('tt.when.now')}
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            {t('tt.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

import { CalendarClock, CreditCard, GraduationCap, Leaf, ParkingMeter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n, type MessageKey } from '@/i18n'

/** Scrolls smoothly to a section of the page (unless the visitor prefers less motion). */
function scrollToSection(id: string) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

// One link for each section of the page (the ids are on the sections in HomePage). Add a line here for a new section.
const LINKS: { id: string; icon: LucideIcon; label: MessageKey }[] = [
  { id: 'cestovne-poriadky', icon: CalendarClock, label: 'home.schedules.title' },
  { id: 'dopravna-karta', icon: CreditCard, label: 'home.card.title' },
  { id: 'preukaz', icon: GraduationCap, label: 'home.student.title' },
  { id: 'parkovanie', icon: ParkingMeter, label: 'home.parking.title' },
  { id: 'zelene-kilometre', icon: Leaf, label: 'account.greenKm' },
]

/**
 * Short ways down to the sections of this page, under the hero text. Small chips side by side, wrapping onto the next
 * line when they do not fit, so all of them are always on the screen.
 */
export function QuickLinks() {
  const { t } = useI18n()
  return (
    <nav className="mt-4 flex flex-wrap gap-1.5">
      {LINKS.map(({ id, icon: Icon, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(id)
          }}
          className="bg-card/70 hover:bg-accent flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur transition-colors"
        >
          <Icon className="size-3.5" />
          {t(label)}
        </a>
      ))}
    </nav>
  )
}

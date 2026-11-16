import { Bus, TrainFront, TramFront, type LucideIcon } from 'lucide-react'
import type { MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Mode } from './types'

export const MODE_LABEL: Record<Mode, MessageKey> = {
  train: 'tt.type.train',
  bus: 'tt.type.bus',
  mhd: 'tt.type.mhd',
}

// Solid discs with a white icon:  trains yellow, buses blue, city transit red, a little deeper than the old Ubian so
// they sit calmly next to the sage theme.
const MODE_COLOR: Record<Mode, string> = {
  train: 'bg-amber-500 text-white',
  bus: 'bg-sky-600 text-white',
  mhd: 'bg-rose-600 text-white',
}

export const MODE_ICON: Record<Mode, LucideIcon> = {
  train: TrainFront,
  bus: Bus,
  mhd: TramFront,
}

/** Small coloured disc with the mode icon. Decorative: the label is always next to it. */
export function ModeDot({ mode, className }: { mode: Mode; className?: string }) {
  const Icon = MODE_ICON[mode]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full',
        MODE_COLOR[mode],
        className,
      )}
    >
      {/* text-inherit! keeps the icon white when a list row is highlighted (the list would turn it dark). */}
      <Icon className="size-3 text-inherit!" />
    </span>
  )
}

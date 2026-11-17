import { useState } from 'react'
import { Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Demo helper: a floating button that shows the page the way it looks on a phone or tablet.
// The page is loaded in an <iframe> of a fixed width, so the real media queries (and the phone-only
// drawers) kick in exactly as on a device. The iframe has its own copy of the app, but it shares
// localStorage, so theme, language and sign-in carry over. It is hidden inside the iframe itself.

type Device = 'auto' | 'phone' | 'tablet'

const SIZES: Record<Exclude<Device, 'auto'>, { w: number; h: number }> = {
  phone: { w: 390, h: 844 },
  tablet: { w: 820, h: 1180 },
}

const OPTIONS: { id: Device; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'auto', label: 'Počítač', hint: 'celé okno', icon: Monitor },
  { id: 'tablet', label: 'Tablet', hint: '820 × 1180', icon: Tablet },
  { id: 'phone', label: 'Telefón', hint: '390 × 844', icon: Smartphone },
]

const KEY = 'ubian.preview'

function load(): Device {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'phone' || v === 'tablet' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function DevicePreview() {
  const [device, setDevice] = useState<Device>(load)
  const [landscape, setLandscape] = useState(false)
  const [open, setOpen] = useState(false)

  // Inside the preview frame itself, do nothing (otherwise it would nest forever).
  if (window.self !== window.top) return null

  function choose(next: Device) {
    setDevice(next)
    setOpen(false)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* ignore */
    }
  }

  const size = device === 'auto' ? null : SIZES[device]
  const w = size ? (landscape ? size.h : size.w) : 0
  const h = size ? (landscape ? size.w : size.h) : 0
  const Current = OPTIONS.find((o) => o.id === device)!.icon

  return (
    <>
      {size && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-auto bg-neutral-200 p-6 pb-20 dark:bg-neutral-900">
          <div
            className="relative shrink-0 rounded-[2.5rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl"
            style={{ width: w + 20, maxWidth: '100%' }}
          >
            <iframe
              title="Náhľad na zariadení"
              src={window.location.href}
              className="block w-full rounded-[1.9rem] bg-background"
              style={{ height: `min(${h}px, calc(100vh - 8rem))` }}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-4 z-[70] flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              className="size-12 rounded-full shadow-lg"
              aria-label="Zmeniť náhľad zariadenia"
            >
              <Current />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="z-[80] w-56 p-1">
            {OPTIONS.map(({ id, label, hint, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent',
                  device === id && 'bg-accent font-medium',
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {size && (
          <Button
            variant="secondary"
            size="icon"
            className="size-12 rounded-full shadow-lg"
            aria-label="Otočiť zariadenie"
            onClick={() => setLandscape((v) => !v)}
          >
            <RotateCw />
          </Button>
        )}
      </div>
    </>
  )
}

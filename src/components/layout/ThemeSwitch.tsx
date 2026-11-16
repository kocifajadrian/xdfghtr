import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setPreference } from '@/lib/theme'

// Light / dark is a plain switch. There is no separate "system" choice here: until the visitor picks one,
// the app follows the device (see watchSystem in lib/theme.ts), and the first click sets an explicit choice.

function isDark() {
  return document.documentElement.classList.contains('dark')
}

/** Current theme plus a function that flips it. Re-renders the caller after a flip. */
export function useThemeSwitch() {
  const [dark, setDark] = useState(isDark)

  function toggle() {
    const next = !isDark()
    setPreference(next ? 'dark' : 'light') // also applies it
    setDark(next)
  }

  return { dark, toggle }
}

/**
 * The sun and the moon in one spot: the sun shows in light mode and turns into the moon in dark mode.
 * It follows the `dark` class on <html>, so it stays right however the theme was changed.
 */
export function ThemeIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block size-4 shrink-0', className)} aria-hidden>
      <Sun className="absolute inset-0 size-full scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute inset-0 size-full scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </span>
  )
}

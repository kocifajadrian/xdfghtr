import { useEffect, useState } from 'react'

/** True while the dark theme is on (the `dark` class on <html>, see lib/theme.ts). Follows theme changes. */
export function useDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const root = document.documentElement
    const update = () => setDark(root.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return dark
}

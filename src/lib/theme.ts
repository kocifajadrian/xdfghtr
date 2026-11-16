// Light / dark / system theme. shadcn uses the `dark` class on <html>.
// index.html applies the saved choice before first paint (no flash); this file keeps it in sync.

export type ThemePreference = 'light' | 'dark' | 'system'
const KEY = 'ubian.theme'

export function getPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function applyPreference(pref: ThemePreference) {
  const dark =
    pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function setPreference(pref: ThemePreference) {
  applyPreference(pref)
  try {
    if (pref === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, pref)
  } catch {
    /* storage can be blocked */
  }
}

/** Re-apply when the device switches between light and dark, if the preference is "system". */
export function watchSystem(): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getPreference() === 'system') applyPreference('system')
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}

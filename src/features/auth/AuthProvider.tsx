import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { env } from '@/config/env'
import { DEMO_USER, login, type User } from './api'
import { AuthContext } from './auth-context'

const KEY = 'ubian.user'

// Storage can throw (private windows, blocked cookies), so every access is guarded.
function readStored(): User | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeStored(user: User | null, remember: boolean) {
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
    if (user) (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user))
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStored() ?? (env.demoSignedIn ? DEMO_USER : null))

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const next = await login(email, password)
    writeStored(next, remember)
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    writeStored(null, false)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

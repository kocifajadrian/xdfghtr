import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useLoginDialog } from './useLoginDialog'

/**
 * Wraps a page that needs a login. Signed in: shows the page. Signed out: shows `fallback`
 * and opens the login popup, which continues to this page after a successful login.
 */
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const { user } = useAuth()
  const { openLogin } = useLoginDialog()
  const { pathname } = useLocation()

  // Open the popup when someone arrives signed out. Do not reopen it when they just signed out here.
  const wasSignedIn = useRef(!!user)
  useEffect(() => {
    if (user) wasSignedIn.current = true
    else if (!wasSignedIn.current) openLogin(pathname)
  }, [user, pathname, openLogin])

  return user ? <>{children}</> : <>{fallback}</>
}

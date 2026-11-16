import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { LoginDialog } from './components/LoginDialog'
import { LoginDialogContext } from './login-dialog-context'

/** Holds the open/closed state of the login popup and renders it, so any screen can open it. */
export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; next?: string }>({ open: false })

  const openLogin = useCallback((next?: string) => setState({ open: true, next }), [])
  const close = useCallback(() => setState((s) => (s.open ? { ...s, open: false } : s)), [])

  const value = useMemo(() => ({ openLogin }), [openLogin])

  return (
    <LoginDialogContext.Provider value={value}>
      {children}
      <LoginDialog open={state.open} next={state.next} onClose={close} />
    </LoginDialogContext.Provider>
  )
}

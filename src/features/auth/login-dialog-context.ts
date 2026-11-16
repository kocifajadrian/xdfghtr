import { createContext } from 'react'

export type LoginDialogValue = {
  /** Open the login popup. Pass the path to continue to after a successful login. */
  openLogin: (next?: string) => void
}

export const LoginDialogContext = createContext<LoginDialogValue | null>(null)

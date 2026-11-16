import { createContext } from 'react'
import type { User } from './api'

export type AuthValue = {
  user: User | null
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

import { createContext } from 'react'
import type { User } from './api'

export type AuthValue = {
  user: User | null
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signOut: () => void
  /** Changes fields of the signed-in user (name, e-mail) and keeps them where the sign-in is stored. */
  updateUser: (patch: Partial<User>) => void
}

export const AuthContext = createContext<AuthValue | null>(null)

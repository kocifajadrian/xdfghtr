/**
 * Login calls. With no API address configured the app uses a MOCK so the demo works without a backend.
 * With VITE_API_URL set, it calls POST {API}/auth/login with { email, password } and expects the
 * signed-in user as JSON: { "email": string, "name": string }. Adjust the path and shape to the real API.
 */
import { env } from '@/config/env'
import type { MessageKey } from '@/i18n'
import { ApiError, http } from '@/lib/http'

export type User = { email: string; name: string }

/** Wrong e-mail or password. Carries the key of the text to show, so the form can translate it. */
export class AuthError extends Error {
  readonly key: MessageKey
  constructor(key: MessageKey) {
    super(key)
    this.key = key
  }
}

// Demo account for the mock API. Remove together with the mock.
export const DEMO_ACCOUNT = { email: 'adrian.kocifaj@gmail.com', password: 'demo1234', name: 'Adrian' }

/** Who the demo is signed in as when it opens (see env.demoSignedIn). A made-up address, so a shared demo shows no real one. */
export const DEMO_USER: User = { email: 'adrian.kocifaj@example.com', name: 'Adrián Kocifaj' }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockLogin(email: string, password: string): Promise<User> {
  await sleep(800)
  const ok = email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password
  if (!ok) throw new AuthError('login.wrongCredentials')
  return { email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name }
}

export async function login(email: string, password: string): Promise<User> {
  if (env.useMockApi) return mockLogin(email, password)

  try {
    return await http<User>('/auth/login', { method: 'POST', body: { email: email.trim(), password } })
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
      throw new AuthError('login.wrongCredentials')
    }
    throw error
  }
}

/**
 * Profile calls: personal and billing data, e-mail (change and confirmation by a code sent to the address), password, account removal.
 * With no API address configured they run on an in-memory mock, so the demo works without a backend.
 * The real calls are not defined yet: when they are, replace the bodies and keep the signatures.
 */
import { env } from '@/config/env'
import { DEMO_ACCOUNT } from '@/features/auth'
import type { MessageKey } from '@/i18n'
import { http } from '@/lib/http'

/** A failure the person can read: `key` is the text to show. */
export class ProfileError extends Error {
  readonly key: MessageKey
  constructor(key: MessageKey) {
    super(key)
    this.key = key
  }
}

/** The code the mock "sends" to every address. The dialogs show it as a hint while the mock is on. */
export const MOCK_CODE = '123456'
/** An address the mock treats as already used by another account. */
export const MOCK_TAKEN_EMAIL = 'obsadeny@example.com'

export const MIN_PASSWORD = 8

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let password = DEMO_ACCOUNT.password
/** The address a code was last sent to for a change (null = the code is for confirming the current address). */
let pendingEmail: string | null = null

function checkPassword(given: string) {
  if (given !== password) throw new ProfileError('profile.wrongPassword')
}

export type Billing = {
  company: string
  ico: string
  vat: string
  street: string
  city: string
  zip: string
}

/** The payment card saved at a purchase (only what may be shown). */
export type PaymentCard = { id: string; brand: string; last4: string; expires: string }

export type Profile = {
  firstName: string
  lastName: string
  phone: string
  /** Where receipts and notices go. The login e-mail is separate and lives in the user. */
  contactEmail: string
  billing: Billing
  /** Takes part in the Green kilometres programme. */
  greenKm: boolean
  paymentCards: PaymentCard[]
}

let mockProfile: Profile | null = null

/** The profile of the signed-in user. The mock starts from the name and e-mail of the sign-in. */
export async function getProfile(user: { email: string; name: string }): Promise<Profile> {
  if (!env.useMockApi) return http<Profile>('/profile')
  if (!mockProfile) {
    const [firstName = '', ...rest] = user.name.trim().split(/\s+/)
    mockProfile = {
      firstName,
      lastName: rest.join(' '),
      phone: '',
      contactEmail: user.email,
      billing: { company: '', ico: '', vat: '', street: '', city: '', zip: '' },
      greenKm: true,
      paymentCards: [
        { id: 'p1', brand: 'Visa', last4: '4242', expires: '09/28' },
        { id: 'p2', brand: 'Mastercard', last4: '5454', expires: '03/27' },
      ],
    }
  }
  return structuredClone(mockProfile)
}

/** Saves the changed fields and returns the whole profile. */
export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  if (!env.useMockApi) return http<Profile>('/profile', { method: 'PATCH', body: patch })
  await sleep(400)
  mockProfile = { ...(mockProfile as Profile), ...patch }
  return structuredClone(mockProfile)
}

export async function removePaymentCard(id: string): Promise<Profile> {
  if (!env.useMockApi) return http<Profile>(`/profile/payment-cards/${id}`, { method: 'DELETE' })
  await sleep(300)
  const profile = mockProfile as Profile
  mockProfile = { ...profile, paymentCards: profile.paymentCards.filter((c) => c.id !== id) }
  return structuredClone(mockProfile)
}

/** Back to a fresh mock profile. Used by tests. */
export function resetMockProfile() {
  mockProfile = null
}

/** Sends a code to the current address, to confirm it. */
export async function sendConfirmation(): Promise<void> {
  if (!env.useMockApi) return http<void>('/profile/email/confirmation', { method: 'POST' })
  await sleep(500)
  pendingEmail = null
}

/** Confirms the current address with the code from the e-mail. */
export async function confirmCurrentEmail(code: string): Promise<void> {
  if (!env.useMockApi) return http<void>('/profile/email/confirm', { method: 'POST', body: { code } })
  await sleep(500)
  if (code !== MOCK_CODE) throw new ProfileError('profile.codeWrong')
}

/** Starts a change of the address: checks the password and sends a code to the NEW address. */
export async function requestEmailChange(
  email: string,
  current: string,
  currentEmail: string,
): Promise<void> {
  if (!env.useMockApi) {
    return http<void>('/profile/email', { method: 'POST', body: { email, password: current } })
  }
  await sleep(600)
  checkPassword(current)
  if (email.trim().toLowerCase() === currentEmail.toLowerCase()) throw new ProfileError('profile.sameEmail')
  if (email.trim().toLowerCase() === MOCK_TAKEN_EMAIL) throw new ProfileError('profile.emailTaken')
  pendingEmail = email.trim()
}

/** Finishes the change with the code sent to the new address. Returns the new address. */
export async function confirmEmailChange(code: string): Promise<string> {
  if (!env.useMockApi) {
    return (await http<{ email: string }>('/profile/email/change', { method: 'POST', body: { code } })).email
  }
  await sleep(500)
  if (code !== MOCK_CODE || !pendingEmail) throw new ProfileError('profile.codeWrong')
  const email = pendingEmail
  pendingEmail = null
  return email
}

export async function changePassword(current: string, next: string): Promise<void> {
  if (!env.useMockApi) {
    return http<void>('/profile/password', { method: 'POST', body: { current, next } })
  }
  await sleep(600)
  checkPassword(current)
  password = next
}

export async function deleteAccount(current: string): Promise<void> {
  if (!env.useMockApi) return http<void>('/profile', { method: 'DELETE', body: { password: current } })
  await sleep(600)
  checkPassword(current)
}

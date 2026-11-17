import type { MessageKey } from '@/i18n'

/** Per invalid field, the key of the message to show. The form translates it. */
export type LoginErrors = { email?: MessageKey; password?: MessageKey }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isEmail = (value: string) => EMAIL_RE.test(value.trim())

/** Checks the login form fields. Returns a message key per invalid field (empty object = valid). */
export function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {}
  if (!email.trim()) errors.email = 'login.emailRequired'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'login.emailInvalid'
  if (!password) errors.password = 'login.passwordRequired'
  return errors
}

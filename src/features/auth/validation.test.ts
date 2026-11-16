import { describe, expect, it } from 'vitest'
import { validateLogin } from './validation'

describe('validateLogin', () => {
  it('asks for both fields when they are empty', () => {
    expect(validateLogin('', '')).toEqual({
      email: 'login.emailRequired',
      password: 'login.passwordRequired',
    })
  })

  it('treats a blank e-mail as missing', () => {
    expect(validateLogin('   ', 'heslo').email).toBe('login.emailRequired')
  })

  it('rejects an e-mail in the wrong format', () => {
    expect(validateLogin('meno@', 'heslo').email).toBe('login.emailInvalid')
    expect(validateLogin('meno.domena.sk', 'heslo').email).toBeDefined()
  })

  it('accepts a valid e-mail and password', () => {
    expect(validateLogin('meno@domena.sk', 'heslo')).toEqual({})
  })

  it('ignores spaces around the e-mail', () => {
    expect(validateLogin('  meno@domena.sk ', 'heslo')).toEqual({})
  })
})

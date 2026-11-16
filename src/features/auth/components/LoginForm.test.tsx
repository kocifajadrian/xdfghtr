import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/i18n'
import { AuthProvider } from '../AuthProvider'
import { AuthError, login } from '../api'
import { LoginForm } from './LoginForm'

// Replace only the network call. Everything else in the module stays real.
vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  login: vi.fn(),
}))

function setup() {
  const onSuccess = vi.fn()
  const user = userEvent.setup()
  render(
    <I18nProvider>
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    </I18nProvider>,
  )
  return { user, onSuccess }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset()
  })

  it('shows a message for each empty field and does not call the API', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Prihlásiť' }))

    expect(screen.getByText('Zadajte e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Zadajte heslo.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows the error from the API when the credentials are wrong', async () => {
    vi.mocked(login).mockRejectedValue(new AuthError('login.wrongCredentials'))
    const { user, onSuccess } = setup()

    await user.type(screen.getByLabelText('E-mail'), 'meno@domena.sk')
    await user.type(screen.getByLabelText('Heslo'), 'zle')
    await user.click(screen.getByRole('button', { name: 'Prihlásiť' }))

    expect(await screen.findByText('Nesprávny e-mail alebo heslo.')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('signs the user in and reports success', async () => {
    vi.mocked(login).mockResolvedValue({ email: 'meno@domena.sk', name: 'Meno' })
    const { user, onSuccess } = setup()

    await user.type(screen.getByLabelText('E-mail'), 'meno@domena.sk')
    await user.type(screen.getByLabelText('Heslo'), 'dobre')
    await user.click(screen.getByRole('button', { name: 'Prihlásiť' }))

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(login).toHaveBeenCalledWith('meno@domena.sk', 'dobre')
  })

  it('can show and hide the password', async () => {
    const { user } = setup()
    const input = screen.getByLabelText('Heslo')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Zobraziť heslo' }))
    expect(input).toHaveAttribute('type', 'text')
  })
})

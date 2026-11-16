import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '@/i18n'
import { AccountMenu } from './AccountMenu'
import { ThemeButton } from './PreferenceButtons'

const user = { email: 'adrian.kocifaj@gmail.com', name: 'Adrian' }

describe('AccountMenu', () => {
  it('shows the e-mail and signs out', async () => {
    const onSignOut = vi.fn()
    const ui = userEvent.setup()
    render(
      <I18nProvider>
        <MemoryRouter>
          <AccountMenu user={user} onSignOut={onSignOut} />
        </MemoryRouter>
      </I18nProvider>,
    )

    await ui.click(screen.getByRole('button', { name: 'Účet' }))
    expect(await screen.findByText('adrian.kocifaj@gmail.com')).toBeInTheDocument()

    await ui.click(screen.getByRole('menuitem', { name: 'Odhlásiť sa' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it('has the cart with its price', async () => {
    const ui = userEvent.setup()
    render(
      <I18nProvider>
        <MemoryRouter>
          <AccountMenu user={user} onSignOut={() => {}} />
        </MemoryRouter>
      </I18nProvider>,
    )

    await ui.click(screen.getByRole('button', { name: 'Účet' }))
    expect(await screen.findByRole('menuitem', { name: /Košík/ })).toHaveTextContent('0,00 €')
  })
})

describe('header icon buttons', () => {
  it('theme button is a switch between light and dark', async () => {
    const ui = userEvent.setup()
    document.documentElement.classList.remove('dark')
    render(
      <I18nProvider>
        <ThemeButton />
      </I18nProvider>,
    )

    await ui.click(screen.getByRole('button', { name: 'Prepnúť na tmavý vzhľad' }))
    expect(document.documentElement).toHaveClass('dark')

    await ui.click(screen.getByRole('button', { name: 'Prepnúť na svetlý vzhľad' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})

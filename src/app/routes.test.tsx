import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from './providers'
import { AppRoutes } from './routes'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  )
}

function signIn() {
  localStorage.setItem('ubian.user', JSON.stringify({ email: 'meno@domena.sk', name: 'Meno' }))
}

const LOGIN_REASON = 'Táto stránka je dostupná po prihlásení.'

describe('pages', () => {
  it('shows the home page to everyone', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'ubian' })).toBeInTheDocument()
  })

  it('shows public pages without a login', () => {
    renderAt('/cestovne-poriadky')
    expect(screen.getByRole('heading', { name: 'Cestovné poriadky' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the login popup when a signed-out visitor opens a protected page', async () => {
    renderAt('/dopravna-karta')

    expect(await screen.findByRole('dialog')).toHaveTextContent(LOGIN_REASON)
    expect(screen.queryByRole('heading', { name: 'Moje dopravné karty' })).not.toBeInTheDocument()
  })

  it('shows a protected page to a signed-in user without any popup', async () => {
    signIn()
    renderAt('/dopravna-karta')

    expect(await screen.findByRole('button', { name: 'Vybrať kartu' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the list of cards', async () => {
    signIn()
    renderAt('/dopravna-karta')
    expect(await screen.findByRole('heading', { name: 'Moje dopravné karty' })).toBeInTheDocument()
  })

  it('shows a not found page for unknown addresses', () => {
    renderAt('/neexistuje')
    expect(screen.getByRole('heading', { name: 'Stránka sa nenašla' })).toBeInTheDocument()
  })

  it('sends the old /login address to the home page', () => {
    renderAt('/login')
    expect(screen.getByRole('heading', { name: 'ubian' })).toBeInTheDocument()
  })
})

describe('menu', () => {
  it('has Domov, which goes back to the start page', async () => {
    const user = userEvent.setup()
    renderAt('/cestovne-poriadky')

    await user.click(screen.getByRole('link', { name: 'Domov' }))
    expect(await screen.findByRole('heading', { name: 'ubian' })).toBeInTheDocument()
  })

  it('opens the timetables page from the menu', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Cestovné poriadky' }))
    expect(await screen.findByRole('heading', { name: 'Cestovné poriadky' })).toBeInTheDocument()
  })

  it('opens the login popup when a signed-out visitor clicks the cards link', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Dopravné karty' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent(LOGIN_REASON)
  })

  it('opens the login popup when a signed-out visitor clicks a protected menu link', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Študentské preukazy' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent(LOGIN_REASON)
  })
})

describe('mobile menu', () => {
  async function openPanel(path = '/') {
    const user = userEvent.setup()
    renderAt(path)
    await user.click(screen.getByRole('button', { name: 'Otvoriť menu' }))
    const panel = await screen.findByRole('dialog')
    return { user, panel }
  }

  it('lists the main items', async () => {
    const { panel } = await openPanel()

    for (const name of ['Domov', 'Cestovné poriadky', 'Dopravné karty', 'Študentské preukazy']) {
      expect(within(panel).getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('goes to a page and closes the panel', async () => {
    const { user, panel } = await openPanel()

    await user.click(within(panel).getByRole('link', { name: 'Cestovné poriadky' }))

    expect(await screen.findByRole('heading', { name: 'Cestovné poriadky' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('opens the login popup instead of a protected page when signed out', async () => {
    const { user, panel } = await openPanel()

    await user.click(within(panel).getByRole('link', { name: 'Dopravné karty' }))

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveTextContent(LOGIN_REASON))
  })
})

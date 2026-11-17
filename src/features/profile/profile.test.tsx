import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import ProfilePage from '@/pages/ProfilePage'
import { MOCK_CODE, resetMockProfile } from './api'

function renderProfile(user: object) {
  localStorage.setItem('ubian.user', JSON.stringify(user))
  return render(
    <MemoryRouter>
      <AppProviders>
        <ProfilePage />
      </AppProviders>
    </MemoryRouter>,
  )
}

const stored = () => JSON.parse(localStorage.getItem('ubian.user')!)

beforeEach(() => {
  resetMockProfile()
  localStorage.clear()
})

describe('profile page', () => {
  it('shows the sign-in e-mail and that it is confirmed', async () => {
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })
    expect(await screen.findByText('meno@domena.sk')).toBeInTheDocument()
    expect(screen.getByText('Potvrdený')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Potvrdiť e-mail' })).not.toBeInTheDocument()
    // The name is split into the two fields.
    expect(screen.getByLabelText('Meno')).toHaveValue('Meno')
    expect(screen.getByLabelText('Priezvisko')).toHaveValue('Priezvisko')
  })

  it('confirms an unconfirmed e-mail with the code', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno', emailVerified: false })
    expect(await screen.findByText('Nepotvrdený')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Potvrdiť e-mail' }))
    await user.click(await screen.findByRole('button', { name: 'Poslať kód' }))
    await user.type(await screen.findByLabelText('Potvrdzovací kód'), '000000')
    await user.click(screen.getByRole('button', { name: 'Potvrdiť e-mail' }))
    expect(await screen.findByText('Kód nie je správny.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Potvrdzovací kód'))
    await user.type(screen.getByLabelText('Potvrdzovací kód'), MOCK_CODE)
    await user.click(screen.getByRole('button', { name: 'Potvrdiť e-mail' }))
    expect(await screen.findByText('E-mail je potvrdený.')).toBeInTheDocument()
    await waitFor(() => expect(stored().emailVerified).toBe(true))
  })

  it('changes the e-mail after the password and the code', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno' })

    await user.click(await screen.findByRole('button', { name: 'Zmeniť e-mail' }))
    await user.type(await screen.findByLabelText('Nový e-mail'), 'nove@domena.sk')
    await user.type(screen.getByLabelText('Aktuálne heslo'), 'zle')
    await user.click(screen.getByRole('button', { name: 'Pokračovať' }))
    expect(await screen.findByText('Nesprávne heslo.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Aktuálne heslo'))
    await user.type(screen.getByLabelText('Aktuálne heslo'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Pokračovať' }))
    await user.type(await screen.findByLabelText('Potvrdzovací kód'), MOCK_CODE)
    await user.click(screen.getByRole('button', { name: 'Zmeniť e-mail' }))

    expect(await screen.findByText('E-mail bol zmenený na nove@domena.sk.')).toBeInTheDocument()
    expect(stored().email).toBe('nove@domena.sk')
  })

  it('checks that the new passwords match (Security part)', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno' })

    await user.click(await screen.findByRole('button', { name: 'Zabezpečenie' }))
    await user.click(await screen.findByRole('button', { name: 'Zmeniť heslo' }))
    await user.type(await screen.findByLabelText('Aktuálne heslo'), 'demo1234')
    await user.type(screen.getByLabelText('Nové heslo'), 'noveheslo1')
    await user.type(screen.getByLabelText('Zopakujte nové heslo'), 'ineheslo22')
    await user.click(screen.getAllByRole('button', { name: 'Zmeniť heslo' }).at(-1)!)
    expect(await screen.findByText('Heslá sa nezhodujú.')).toBeInTheDocument()
  })

  it('saves the personal data and the name shown in the menu follows', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })

    const first = await screen.findByLabelText('Meno')
    await user.clear(first)
    await user.type(first, 'Nové')
    await user.click(screen.getByRole('button', { name: 'Uložiť' }))
    expect(await screen.findByText('Zmeny sú uložené.')).toBeInTheDocument()
    expect(stored().name).toBe('Nové Priezvisko')
  })

  it('does not save an invalid phone number', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })

    await user.type(await screen.findByLabelText('Telefónne číslo'), '12')
    await user.click(screen.getByRole('button', { name: 'Uložiť' }))
    expect(await screen.findByText('Zadajte číslo v tvare +421 900 000 000.')).toBeInTheDocument()
  })

  it('validates the company ID (Billing part)', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })

    await user.click(await screen.findByRole('button', { name: 'Fakturácia' }))
    await user.type(await screen.findByLabelText('IČO'), '123')
    await user.click(screen.getByRole('button', { name: 'Uložiť' }))
    expect(await screen.findByText('IČO má 8 číslic.')).toBeInTheDocument()
  })

  it('lists the saved payment cards and removes one (Payment cards part)', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })

    await user.click(await screen.findByRole('button', { name: 'Platobné karty' }))
    expect(await screen.findByText(/Visa •••• 4242/)).toBeInTheDocument()
    expect(screen.getByText(/Mastercard •••• 5454/)).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Odstrániť kartu' })[0])
    await waitFor(() => expect(screen.queryByText(/Visa •••• 4242/)).not.toBeInTheDocument())
    expect(screen.getByText(/Mastercard •••• 5454/)).toBeInTheDocument()
  })

  it('switches the Green kilometres programme off (Preferences part)', async () => {
    const user = userEvent.setup()
    renderProfile({ email: 'meno@domena.sk', name: 'Meno Priezvisko' })

    await user.click(await screen.findByRole('button', { name: 'Preferencie' }))
    const toggle = await screen.findByRole('switch', { name: 'Zelené kilometre' })
    expect(toggle).toBeChecked()
    await user.click(toggle)
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Zelené kilometre' })).not.toBeChecked())
  })
})

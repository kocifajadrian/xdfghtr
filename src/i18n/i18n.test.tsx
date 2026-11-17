import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/app/routes'
import { LanguageButton } from '@/components/layout/PreferenceButtons'
import { I18nProvider } from './I18nProvider'
import { detectLanguage, translate } from './translate'

function renderButton() {
  return render(
    <I18nProvider>
      <LanguageButton />
    </I18nProvider>,
  )
}

// The app ships with only Slovak switched on, so switch the others on here to test switching.
vi.mock('./languages', async (importOriginal) => {
  const original = await importOriginal<typeof import('./languages')>()
  const LANGUAGES = original.LANGUAGES.map((l) => ({ ...l, enabled: true }))
  return {
    ...original,
    LANGUAGES,
    isLanguage: (value: unknown) => LANGUAGES.some((l) => l.code === value),
  }
})

describe('translate', () => {
  it('returns the text of the language', () => {
    expect(translate('sk', 'nav.home')).toBe('Domov')
    expect(translate('en', 'nav.home')).toBe('Home')
    expect(translate('pl', 'nav.home')).toBe('Strona główna')
  })

  it('fills in placeholders', () => {
    expect(translate('sk', 'orders.count', { shown: 3, total: 10 })).toBe('Zobrazených 3 z 10')
  })
})

describe('detectLanguage', () => {
  it('uses the saved choice first', () => {
    localStorage.setItem('ubian.lang', 'pl')
    expect(detectLanguage()).toBe('pl')
  })

  it('ignores a saved value that is not a language we have', () => {
    localStorage.setItem('ubian.lang', 'fr')
    expect(detectLanguage()).toBe('sk')
  })

  it('falls back to the browser language', () => {
    const languages = vi.spyOn(navigator, 'languages', 'get')
    languages.mockReturnValue(['fr-FR', 'pl-PL'])
    expect(detectLanguage()).toBe('pl')
    languages.mockRestore()
  })
})

describe('language button', () => {
  it('shows the flag and code of the current language', () => {
    renderButton()
    const button = screen.getByRole('button', { name: 'Jazyk: Slovenčina' })
    expect(button).toHaveTextContent('SK')
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it('lists the six languages in order, each with a flag', async () => {
    const ui = userEvent.setup()
    renderButton()
    await ui.click(screen.getByRole('button', { name: /Jazyk/ }))

    const names = ['Slovenčina', 'English', 'Deutsch', 'Polski', 'Українська', 'Magyar']
    expect((await screen.findAllByRole('menuitemradio')).map((i) => i.textContent)).toEqual(names)
    for (const name of names) {
      const item = await screen.findByRole('menuitemradio', { name })
      expect(item.querySelector('svg')).not.toBeNull()
    }
    expect(screen.getByRole('menuitemradio', { name: 'Slovenčina' })).toBeChecked()
  })

  it('switches the language, remembers it and sets <html lang>', async () => {
    const ui = userEvent.setup()
    renderButton()
    await ui.click(screen.getByRole('button', { name: /Jazyk/ }))
    await ui.click(await screen.findByRole('menuitemradio', { name: 'Polski' }))

    expect(await screen.findByRole('button', { name: 'Język: Polski' })).toHaveTextContent('PL')
    expect(localStorage.getItem('ubian.lang')).toBe('pl')
    expect(document.documentElement.lang).toBe('pl')
  })
})

describe('whole app', () => {
  it('translates pages, menu and login popup when the language changes', async () => {
    const ui = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'ubian' })).toBeInTheDocument()

    await ui.click(screen.getByRole('button', { name: /Jazyk/ }))
    await ui.click(await screen.findByRole('menuitemradio', { name: 'English' }))

    expect(await screen.findByText(/worry-free/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Timetables' })).toBeInTheDocument()

    await ui.click(screen.getAllByRole('button', { name: 'Sign in' })[0])
    expect(await screen.findByRole('dialog')).toHaveTextContent('Welcome back')
  })
})

// Single source of truth for pages: the router and the header menu both read from here.

import type { MessageKey } from '@/i18n'

export const ROUTES = {
  home: '/',
  timetables: '/cestovne-poriadky',
  card: {
    root: '/dopravna-karta',
  },
  pass: '/preukaz',
  // Pages in the account menu.
  profile: '/profil',
  orders: '/objednavky',
  notifications: '/notifikacie',
  greenKm: '/zelene-kilometre',
} as const

export type NavLinkItem = {
  /** Key of the menu text (see i18n/messages). */
  labelKey: MessageKey
  to: string
  /** Needs a signed-in user. Signed-out visitors get the login popup instead of the page. */
  protected: boolean
}

/**
 * A group is also a link: hovering it shows its pages, clicking its title goes to `to`,
 * which is the group's address and shows the list of its pages' main screen.
 */
export type NavGroupItem = NavLinkItem & { children: NavLinkItem[] }
export type NavItem = NavLinkItem | NavGroupItem

export function isNavGroup(item: NavItem): item is NavGroupItem {
  return 'children' in item
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', to: ROUTES.home, protected: false },
  { labelKey: 'nav.timetables', to: ROUTES.timetables, protected: false },
  { labelKey: 'nav.card', to: ROUTES.card.root, protected: true },
  { labelKey: 'nav.pass', to: ROUTES.pass, protected: true },
]

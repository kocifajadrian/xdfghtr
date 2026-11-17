import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { NAV_ITEMS, ROUTES, isNavGroup, type NavLinkItem } from '@/config/navigation'
import { useAuth, useLoginDialog } from '@/features/auth'
import { useI18n } from '@/i18n'
import { watchSystem } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'
import { AccountMenu } from './AccountMenu'
import { MobileNav } from './MobileNav'
import { LanguageButton, ThemeButton } from './PreferenceButtons'

export function SiteHeader() {
  const { user, signOut } = useAuth()
  const { openLogin } = useLoginDialog()
  const { t } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Follow the device's light / dark switch while the theme is set to "system".
  useEffect(() => watchSystem(), [])

  // Signed-out visitors get the login popup instead of a protected page.
  function guard(event: MouseEvent, link: NavLinkItem) {
    if (link.protected && !user) {
      event.preventDefault()
      openLogin(link.to)
    }
  }

  return (
    // Stays on top while the page scrolls underneath.
    <header className="bg-background/80 sticky top-0 z-40 backdrop-blur">
      {/* Centred column. Left: the menu (a menu button on narrow screens). Right: language, theme and the
          account buttons, in that order. */}
      <div className="mx-auto flex h-11 w-full max-w-[1000px] items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <MobileNav />

          <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList>
              {NAV_ITEMS.map((item) =>
                isNavGroup(item) ? (
                  <NavigationMenuItem key={item.to} value={item.to}>
                    {/* The title only opens the dropdown; just the pages inside it are links. */}
                    <NavigationMenuTrigger
                      className={cn(
                        (pathname === item.to || item.children.some((c) => c.to === pathname)) &&
                          'bg-accent/50',
                      )}
                    >
                      {t(item.labelKey)}
                    </NavigationMenuTrigger>
                    {/* Same density as the standard shadcn dropdown menu: small panel padding, compact rows. */}
                    <NavigationMenuContent className="p-1">
                      <ul className="grid w-52">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavigationMenuLink
                              asChild
                              active={pathname === child.to}
                              className="px-2 py-1.5"
                            >
                              <Link to={child.to} onClick={(e) => guard(e, child)}>
                                {t(child.labelKey)}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.to}>
                    <NavigationMenuLink
                      asChild
                      active={pathname === item.to}
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link
                        to={item.to}
                        onClick={(e) => guard(e, item)}
                        aria-label={item.to === ROUTES.home ? t(item.labelKey) : undefined}
                      >
                        {item.to === ROUTES.home ? (
                          <Logo className="relative -top-[0.9px] text-[17px]" markClassName="!h-[1.3em] !w-[1.91em]" />
                        ) : (
                          t(item.labelKey)
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Theme and language are always here. Then: log in, or the account menu (cart, email, sign out). */}
        <div className="flex items-center gap-1">
          <ThemeButton />
          <LanguageButton />
          {user ? (
            <AccountMenu
              user={user}
              onSignOut={() => {
                signOut()
                navigate(ROUTES.home)
              }}
            />
          ) : (
            <Button className="ml-1" onClick={() => openLogin()}>
              {t('header.signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

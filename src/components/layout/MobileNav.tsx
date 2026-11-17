import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/brand/Logo'
import { NAV_ITEMS, ROUTES, isNavGroup, type NavLinkItem } from '@/config/navigation'
import { useAuth, useLoginDialog } from '@/features/auth'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

const linkClass = 'block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'

function MobileNavLink({
  link,
  active,
  onChoose,
  className,
}: {
  link: NavLinkItem
  active: boolean
  onChoose: (event: MouseEvent, link: NavLinkItem) => void
  className?: string
}) {
  const { t } = useI18n()
  return (
    <Link
      to={link.to}
      onClick={(e) => onChoose(e, link)}
      aria-current={active ? 'page' : undefined}
      className={cn(linkClass, active && 'bg-accent font-medium', className)}
    >
      {t(link.labelKey)}
    </Link>
  )
}

/**
 * Menu for narrow screens: the same items as the header menu, in a side panel that opens from the left.
 * A group title is not a link: tapping it expands or hides the group's pages below it.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  // Addresses of the expanded groups. Opening one leaves the others as they are.
  const [expanded, setExpanded] = useState<string[]>([])
  const { user } = useAuth()
  const { t } = useI18n()
  const { openLogin } = useLoginDialog()
  const { pathname } = useLocation()

  const activeGroup = NAV_ITEMS.find(
    (item) => isNavGroup(item) && (pathname === item.to || item.children.some((c) => c.to === pathname)),
  )

  // Opening the panel expands the group the visitor is currently in.
  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) setExpanded(activeGroup ? [activeGroup.to] : [])
  }

  // Close the panel on every choice. Signed-out visitors get the login popup for protected pages.
  function choose(event: MouseEvent, link: NavLinkItem) {
    setOpen(false)
    if (link.protected && !user) {
      event.preventDefault()
      openLogin(link.to)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Left side of the header, where the logo will go next to it. */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu />
          <span className="sr-only">{t('mobileNav.open')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="w-72 overflow-y-auto">
        {/* Logo centred in the panel's top row. Closing: tap outside, press Escape, or choose a link. The title stays for screen readers. */}
        <SheetHeader className="relative flex h-24 flex-row items-center justify-center p-0 pt-2">
          <SheetTitle className="sr-only">{t('mobileNav.title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('mobileNav.description')}</SheetDescription>
          <Link
            to={ROUTES.home}
            onClick={() => setOpen(false)}
            aria-label="ubian"
            className="rounded-md px-2 py-1"
          >
            <Logo className="text-3xl" />
          </Link>
        </SheetHeader>
        <nav aria-label={t('mobileNav.title')} className="flex flex-col gap-1 px-4 pt-2 pb-4">
          {NAV_ITEMS.map((item) =>
            isNavGroup(item) ? (
              <Collapsible
                key={item.to}
                open={expanded.includes(item.to)}
                onOpenChange={(isOpen) =>
                  setExpanded((current) =>
                    isOpen ? [...current, item.to] : current.filter((to) => to !== item.to),
                  )
                }
              >
                {/* The whole title row only expands or hides the group's pages. */}
                <CollapsibleTrigger
                  className={cn(
                    linkClass,
                    'flex w-full items-center justify-between text-left data-[state=open]:[&>svg]:rotate-180',
                    item.children.some((c) => c.to === pathname) && 'font-medium',
                  )}
                >
                  {t(item.labelKey)}
                  <ChevronDown className="size-4 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 mb-1 ml-4 flex flex-col border-l pl-2">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <MobileNavLink link={child} active={pathname === child.to} onChoose={choose} />
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <MobileNavLink key={item.to} link={item} active={pathname === item.to} onChoose={choose} />
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

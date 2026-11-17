import { Link } from 'react-router-dom'
import { ArrowDownUp, Bell, Leaf, LogOut, ShoppingCart, User as UserIcon } from 'lucide-react'
import { ROUTES } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/features/auth'
import { useI18n } from '@/i18n'

/** Signed-in menu: who is signed in, the cart and sign out. Language and theme stay in the header. */
export function AccountMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { t, formatEuro } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ml-1" aria-label={t('account.label')}>
          <UserIcon />
          {/* The e-mail without the "@domain" part. Shortened when long, so it fits on a phone. */}
          <span className="max-w-24 truncate sm:max-w-40">{user.email.split('@')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem asChild className="items-start">
          <Link to={ROUTES.profile}>
            <UserIcon className="mt-0.5" />
            <span className="flex min-w-0 flex-col">
              <span className="font-medium">{t('account.profile')}</span>
              {/* Wraps instead of cutting off, so a very long address can still be read in full. */}
              <span className="text-muted-foreground text-xs font-normal break-all">{user.email}</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {[
          { to: ROUTES.orders, icon: ArrowDownUp, label: t('account.orders') },
          { to: ROUTES.notifications, icon: Bell, label: t('account.notifications') },
          { to: ROUTES.greenKm, icon: Leaf, label: t('account.greenKm') },
        ].map(({ to, icon: Icon, label }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to}>
              <Icon />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />

        {/* The cart. It is a placeholder until there is a cart page. */}
        <DropdownMenuItem>
          <ShoppingCart />
          {t('account.cart')}
          <span className="text-muted-foreground ml-auto">{formatEuro(0)}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut />
          {t('account.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

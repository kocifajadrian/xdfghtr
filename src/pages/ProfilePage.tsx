import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Receipt,
  SlidersHorizontal,
  Lock,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/config/navigation'
import { useAuth } from '@/features/auth'
import { getProfile, removePaymentCard, saveProfile, type Profile } from '@/features/profile/api'
import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  ConfirmEmailDialog,
  DeleteAccountDialog,
} from '@/features/profile/ProfileDialogs'
import {
  BillingSection,
  DeleteSection,
  PaymentsSection,
  PersonalSection,
  PreferencesSection,
  SecuritySection,
} from '@/features/profile/ProfileSections'
import { useI18n, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/lib/use-media-query'

type Dialog = 'confirm' | 'email' | 'password' | 'delete'

const SECTIONS = [
  { id: 'osobne', icon: UserIcon, title: 'profile.personal', text: 'profile.personal.text' },
  { id: 'zabezpecenie', icon: Lock, title: 'profile.security', text: 'profile.security.text' },
  { id: 'fakturacia', icon: Receipt, title: 'profile.billing', text: 'profile.billing.text' },
  { id: 'platby', icon: CreditCard, title: 'profile.payment', text: 'profile.payment.text' },
  { id: 'preferencie', icon: SlidersHorizontal, title: 'profile.preferences', text: 'profile.greenKm.text' },
] as const satisfies readonly { id: string; icon: LucideIcon; title: MessageKey; text: MessageKey }[]

const DELETE = { id: 'zmazat', icon: Trash2, title: 'profile.delete', text: 'profile.delete.text' } as const

type SectionId = (typeof SECTIONS)[number]['id'] | typeof DELETE.id

/** "Adrián Kocifaj" -> "AK". */
function initials(name: string, fallback: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return (letters || fallback.slice(0, 1)).toUpperCase()
}

/**
 * The profile of the signed-in user. On a computer a small menu on the left (personal data, security, billing,
 * preferences) and the chosen part on the right; on a phone the menu is a list and a part replaces it.
 * The chosen part is kept in the address (?sekcia=). No boxes: thin lines only.
 */
export default function ProfilePage() {
  const { t } = useI18n()
  const { user, updateUser, signOut } = useAuth()
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState<Dialog | null>(null)
  const close = (dialog: Dialog) => (isOpen: boolean) => setOpen(isOpen ? dialog : null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [failed, setFailed] = useState(false)
  const email = user?.email
  const name = user?.name

  useEffect(() => {
    if (email === undefined || name === undefined) return
    let current = true
    getProfile({ email, name }).then(
      (result) => current && setProfile(result),
      () => current && setFailed(true),
    )
    return () => {
      current = false
    }
    // Load once per signed-in address. A changed name comes from this very page, so it must not reload.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  if (!user) return null // RequireAuth does not render this page without a user

  const all = [...SECTIONS, DELETE]
  const chosen = all.find((s) => s.id === params.get('sekcia'))
  const selected = chosen ?? (isPhone ? undefined : SECTIONS[0])
  const select = (id: SectionId) => setParams({ sekcia: id }, { replace: !isPhone })

  async function save(patch: Partial<Profile>) {
    const next = await saveProfile(patch)
    setProfile(next)
    if (patch.firstName !== undefined || patch.lastName !== undefined) {
      updateUser({ name: `${next.firstName} ${next.lastName}`.trim() })
    }
  }

  const menu = (
    <nav aria-label={t('account.profile')} className={cn('flex flex-col', isPhone ? 'divide-y' : 'gap-0.5')}>
      {all.map(({ id, icon: Icon, title, text }) => {
        const on = selected?.id === id
        const danger = id === DELETE.id
        return (
          <div key={id} className={cn(danger && !isPhone && 'mt-3 border-t pt-3')}>
            <button
              type="button"
              aria-current={on ? 'page' : undefined}
              onClick={() => select(id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-left transition-colors',
                isPhone ? 'px-1 py-3.5' : 'px-3 py-2 text-sm',
                !isPhone && (on ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/60'),
                danger && 'text-destructive',
              )}
            >
              <Icon className={cn('size-4 shrink-0', isPhone && 'size-5')} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn(isPhone && 'font-medium')}>{t(title)}</span>
                {isPhone && !danger && (
                  <span className="text-muted-foreground truncate text-xs">{t(text)}</span>
                )}
              </span>
              {isPhone && <ChevronRight className="text-muted-foreground size-4" />}
            </button>
          </div>
        )
      })}
    </nav>
  )

  const content = failed ? (
    <p className="text-destructive text-sm">{t('profile.error')}</p>
  ) : !profile ? (
    <div className="flex justify-center p-10">
      <Spinner />
    </div>
  ) : (
    selected && (
      <section className="flex min-w-0 flex-col gap-6">
        {isPhone && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 self-start"
            onClick={() => setParams({}, { replace: true })}
          >
            <ChevronLeft />
            {t('profile.back')}
          </Button>
        )}
        <div>
          <h2
            className={cn(
              'text-xl font-semibold tracking-tight',
              selected.id === 'zmazat' && 'text-destructive',
            )}
          >
            {t(selected.title)}
          </h2>
          {selected.id === 'osobne' && (
            <p className="text-muted-foreground text-sm">{t('profile.personal.text')}</p>
          )}
          {selected.id === 'zabezpecenie' && (
            <p className="text-muted-foreground text-sm">{t('profile.security.text')}</p>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {selected.id === 'osobne' && (
            <PersonalSection
              profile={profile}
              user={user}
              onSave={save}
              onConfirmEmail={() => setOpen('confirm')}
              onChangeEmail={() => setOpen('email')}
            />
          )}
          {selected.id === 'zabezpecenie' && <SecuritySection onChangePassword={() => setOpen('password')} />}
          {selected.id === 'fakturacia' && <BillingSection profile={profile} onSave={save} />}
          {selected.id === 'platby' && (
            <PaymentsSection
              profile={profile}
              onRemove={async (id) => setProfile(await removePaymentCard(id))}
            />
          )}
          {selected.id === 'preferencie' && <PreferencesSection profile={profile} onSave={save} />}
          {selected.id === 'zmazat' && <DeleteSection onDelete={() => setOpen('delete')} />}
        </div>
      </section>
    )
  )

  return (
    <PageLayout>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 p-3 sm:p-4">
        <PageBreadcrumb
          items={[{ label: t('nav.home'), to: ROUTES.home }, { label: t('account.profile') }]}
        />
        <h1 className="sr-only">{t('account.profile')}</h1>

        <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-12">
          {(!isPhone || !selected) && (
            <aside className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="from-primary to-primary/50 text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold"
                >
                  {initials(user.name, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name || t('account.profile')}</p>
                  <p className="text-muted-foreground text-xs">{t('account.profile')}</p>
                </div>
              </div>
              {menu}
            </aside>
          )}
          {content}
        </div>
      </div>

      <ConfirmEmailDialog
        open={open === 'confirm'}
        onOpenChange={close('confirm')}
        email={user.email}
        onConfirmed={() => updateUser({ emailVerified: true })}
      />
      <ChangeEmailDialog
        open={open === 'email'}
        onOpenChange={close('email')}
        currentEmail={user.email}
        onChanged={(email) => updateUser({ email, emailVerified: true })}
      />
      <ChangePasswordDialog open={open === 'password'} onOpenChange={close('password')} />
      <DeleteAccountDialog
        open={open === 'delete'}
        onOpenChange={close('delete')}
        onDeleted={() => {
          signOut()
          navigate(ROUTES.home)
        }}
      />
    </PageLayout>
  )
}

import { useState, type FormEvent, type ReactNode } from 'react'
import { BadgeCheck, CircleAlert, CreditCard, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ROUTES } from '@/config/navigation'
import { isEmail, type User } from '@/features/auth'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Billing, Profile } from './api'
import { TextField } from './fields'

export type Save = (patch: Partial<Profile>) => Promise<void>

/** Runs a save and keeps its state for the form: busy, "saved" and a failure. */
function useSaving(save: Save) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(false)
  async function run(patch: Partial<Profile>) {
    setSaving(true)
    setSaved(false)
    setFailed(false)
    try {
      await save(patch)
      setSaved(true)
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }
  return { saving, saved, setSaved, failed, run }
}

function SaveRow({
  dirty,
  saving,
  saved,
  failed,
}: {
  dirty: boolean
  saving: boolean
  saved: boolean
  failed: boolean
}) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3">
      {(dirty || saving) && (
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" />}
          {t('profile.save')}
        </Button>
      )}
      {saved && !dirty && <span className="text-primary text-sm">{t('profile.saved')}</span>}
      {failed && <span className="text-destructive text-sm">{t('profile.error')}</span>}
    </div>
  )
}

/** One part of a section: an optional small title, then its content, separated from the next by a thin line. */
function Block({ title, text, children }: { title?: string; text?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t pt-6 first:border-0 first:pt-0">
      {(title || text) && (
        <div>
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

/** A value on the left and its action on the right. */
function Line({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
      {action && <div className="-mt-1 shrink-0">{action}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function PersonalSection({
  profile,
  user,
  onSave,
  onConfirmEmail,
  onChangeEmail,
}: {
  profile: Profile
  user: User
  onSave: Save
  onConfirmEmail: () => void
  onChangeEmail: () => void
}) {
  const { t } = useI18n()
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [phone, setPhone] = useState(profile.phone)
  const [contactEmail, setContactEmail] = useState(profile.contactEmail)
  const [touched, setTouched] = useState(false)
  const { saving, saved, setSaved, failed, run } = useSaving(onSave)

  const errors = {
    firstName: firstName.trim() ? null : t('profile.nameRequired'),
    lastName: lastName.trim() ? null : t('profile.lastNameRequired'),
    phone: !phone.trim() || /^\+?[\d\s]{9,16}$/.test(phone.trim()) ? null : t('profile.phoneInvalid'),
    contactEmail: !contactEmail.trim()
      ? t('login.emailRequired')
      : !isEmail(contactEmail)
        ? t('login.emailInvalid')
        : null,
  }
  const dirty =
    firstName.trim() !== profile.firstName ||
    lastName.trim() !== profile.lastName ||
    phone.trim() !== profile.phone ||
    contactEmail.trim() !== profile.contactEmail
  const verified = user.emailVerified !== false

  function edit(set: (v: string) => void) {
    return (e: { target: { value: string } }) => {
      set(e.target.value)
      setSaved(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (Object.values(errors).some(Boolean) || saving) return
    await run({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      contactEmail: contactEmail.trim(),
    })
  }

  return (
    <>
      <Block>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="profile-first-name"
              label={t('profile.firstName')}
              value={firstName}
              onChange={edit(setFirstName)}
              autoComplete="given-name"
              error={touched ? errors.firstName : null}
            />
            <TextField
              id="profile-last-name"
              label={t('profile.lastName')}
              value={lastName}
              onChange={edit(setLastName)}
              autoComplete="family-name"
              error={touched ? errors.lastName : null}
            />
            <TextField
              id="profile-phone"
              label={t('profile.phone')}
              value={phone}
              onChange={edit(setPhone)}
              type="tel"
              autoComplete="tel"
              placeholder="+421 900 000 000"
              error={touched ? errors.phone : null}
            />
            <TextField
              id="profile-contact-email"
              label={t('profile.contactEmail')}
              value={contactEmail}
              onChange={edit(setContactEmail)}
              type="email"
              autoComplete="email"
              hint={t('profile.contactEmail.text')}
              error={touched ? errors.contactEmail : null}
            />
          </div>
          <SaveRow dirty={dirty} saving={saving} saved={saved} failed={failed} />
        </form>
      </Block>

      <Block title={t('profile.loginEmail')}>
        <Line
          action={
            <Button variant="ghost" size="sm" onClick={onChangeEmail}>
              {t('profile.email.change')}
            </Button>
          }
        >
          <p className="font-medium break-all">{user.email}</p>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              verified ? 'text-primary' : 'text-destructive',
            )}
          >
            {verified ? <BadgeCheck className="size-3.5" /> : <CircleAlert className="size-3.5" />}
            {t(verified ? 'profile.email.verified' : 'profile.email.unverified')}
          </span>
        </Line>
        {!verified && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground text-sm">{t('profile.email.unverifiedText')}</p>
            <Button size="sm" onClick={onConfirmEmail}>
              {t('profile.email.confirm')}
            </Button>
          </div>
        )}
      </Block>
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function SecuritySection({ onChangePassword }: { onChangePassword: () => void }) {
  const { t } = useI18n()
  return (
    <Block>
      <Line
        action={
          <Button variant="ghost" size="sm" onClick={onChangePassword}>
            {t('profile.password.change')}
          </Button>
        }
      >
        <p className="font-medium">{t('profile.password')}</p>
        <p className="text-muted-foreground text-sm tracking-widest">••••••••</p>
      </Line>
    </Block>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function BillingSection({ profile, onSave }: { profile: Profile; onSave: Save }) {
  const { t } = useI18n()
  const [billing, setBilling] = useState<Billing>(profile.billing)
  const [touched, setTouched] = useState(false)
  const { saving, saved, setSaved, failed, run } = useSaving(onSave)

  const errors = {
    ico:
      !billing.ico.trim() || /^\d{8}$/.test(billing.ico.replace(/\s/g, '')) ? null : t('profile.icoInvalid'),
    zip: !billing.zip.trim() || /^\d{3}\s?\d{2}$/.test(billing.zip.trim()) ? null : t('profile.zipInvalid'),
  }
  const dirty = (Object.keys(billing) as (keyof Billing)[]).some(
    (key) => billing[key].trim() !== profile.billing[key],
  )

  const field = (key: keyof Billing, label: string, extra?: Partial<React.ComponentProps<'input'>>) => ({
    id: `profile-billing-${key}`,
    label,
    value: billing[key],
    onChange: (e: { target: { value: string } }) => {
      setBilling((b) => ({ ...b, [key]: e.target.value }))
      setSaved(false)
    },
    ...extra,
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (errors.ico || errors.zip || saving) return
    const trimmed = Object.fromEntries(Object.entries(billing).map(([k, v]) => [k, v.trim()])) as Billing
    await run({ billing: trimmed })
  }

  return (
    <Block title={t('profile.billing.title')} text={t('profile.billing.text')}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-6">
          <TextField
            {...field('company', t('profile.company'), { autoComplete: 'organization' })}
            className="sm:col-span-6"
          />
          <TextField
            {...field('ico', t('profile.ico'), { inputMode: 'numeric' })}
            className="sm:col-span-3"
            error={touched ? errors.ico : null}
          />
          <TextField {...field('vat', t('profile.vat'))} className="sm:col-span-3" />
          <TextField
            {...field('street', t('profile.street'), { autoComplete: 'street-address' })}
            className="sm:col-span-6"
          />
          <TextField
            {...field('city', t('profile.city'), { autoComplete: 'address-level2' })}
            className="sm:col-span-4"
          />
          <TextField
            {...field('zip', t('profile.zip'), { autoComplete: 'postal-code', inputMode: 'numeric' })}
            className="sm:col-span-2"
            error={touched ? errors.zip : null}
          />
        </div>
        <SaveRow dirty={dirty} saving={saving} saved={saved} failed={failed} />
      </form>
    </Block>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function PaymentsSection({
  profile,
  onRemove,
}: {
  profile: Profile
  onRemove: (id: string) => Promise<void>
}) {
  const { t } = useI18n()
  const [removing, setRemoving] = useState<string | null>(null)
  return (
    <Block text={t('profile.payment.text')}>
      {profile.paymentCards.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('profile.payment.none')}</p>
      ) : (
        <ul className="divide-y">
          {profile.paymentCards.map((card) => (
            <li key={card.id} className="py-3 first:pt-0">
              <Line
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removing === card.id}
                    onClick={async () => {
                      setRemoving(card.id)
                      try {
                        await onRemove(card.id)
                      } finally {
                        setRemoving(null)
                      }
                    }}
                  >
                    {t('profile.payment.remove')}
                  </Button>
                }
              >
                <p className="flex items-center gap-2 font-medium">
                  <CreditCard className="text-muted-foreground size-4" />
                  {card.brand} •••• {card.last4}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('profile.payment.expires', { date: card.expires })}
                </p>
              </Line>
            </li>
          ))}
        </ul>
      )}
    </Block>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function PreferencesSection({ profile, onSave }: { profile: Profile; onSave: Save }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  return (
    <Block>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-medium">{t('profile.greenKm')}</p>
          <p className="text-muted-foreground text-sm">{t('profile.greenKm.text')}</p>
          <p className="text-muted-foreground text-sm">
            {t('profile.greenKm.cancel')}{' '}
            <Link to={ROUTES.greenKm} className="text-primary underline-offset-4 hover:underline">
              {t('profile.greenKm.rules')}
            </Link>
          </p>
        </div>
        <Switch
          checked={profile.greenKm}
          disabled={busy}
          aria-label={t('profile.greenKm')}
          onCheckedChange={async (checked) => {
            setBusy(true)
            try {
              await onSave({ greenKm: checked })
            } finally {
              setBusy(false)
            }
          }}
        />
      </div>
    </Block>
  )
}

// ---------------------------------------------------------------------------------------------------------------------

export function DeleteSection({ onDelete }: { onDelete: () => void }) {
  const { t } = useI18n()
  return (
    <Block>
      <p className="text-muted-foreground text-sm">{t('profile.delete.text')}</p>
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive self-start"
        onClick={onDelete}
      >
        {t('profile.delete')}
      </Button>
    </Block>
  )
}

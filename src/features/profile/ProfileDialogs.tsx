import { useState, type FormEvent, type ReactNode } from 'react'
import { CircleCheck, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { env } from '@/config/env'
import { isEmail } from '@/features/auth'
import { useI18n, type MessageKey } from '@/i18n'
import { TextField } from './fields'
import {
  changePassword,
  confirmCurrentEmail,
  confirmEmailChange,
  deleteAccount,
  MIN_PASSWORD,
  MOCK_CODE,
  ProfileError,
  requestEmailChange,
  sendConfirmation,
} from './api'

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

/** A busy flag and a readable error for the action of a dialog. */
function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<MessageKey | null>(null)
  async function run<T>(action: () => Promise<T>): Promise<{ value: T } | null> {
    setBusy(true)
    setError(null)
    try {
      return { value: await action() }
    } catch (err) {
      setError(err instanceof ProfileError ? err.key : 'profile.error')
      return null
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run, clearError: () => setError(null) }
}

/** The shell of every dialog here. Its content is removed on close, so each opening starts fresh. */
function Shell({ open, onOpenChange, children }: DialogProps & { children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">{children}</DialogContent>
    </Dialog>
  )
}

function ErrorNote({ error }: { error: MessageKey | null }) {
  const { t } = useI18n()
  return (
    error && (
      <Alert variant="destructive">
        <AlertDescription>{t(error)}</AlertDescription>
      </Alert>
    )
  )
}

function Done({ text, onClose }: { text: string; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <>
      <div className="flex flex-col items-center gap-3 py-4 text-center text-sm">
        <CircleCheck className="text-primary size-10" />
        <p>{text}</p>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onClose} className="w-full sm:w-auto">
          {t('profile.done')}
        </Button>
      </DialogFooter>
    </>
  )
}

function Submit({ busy, label, destructive }: { busy: boolean; label: string; destructive?: boolean }) {
  return (
    <DialogFooter>
      <Button
        type="submit"
        disabled={busy}
        variant={destructive ? 'destructive' : 'default'}
        className="w-full sm:w-auto"
      >
        {busy && <LoaderCircle className="animate-spin" />}
        {label}
      </Button>
    </DialogFooter>
  )
}

/** The code field with the demo hint (only while the mock API is on). */
function CodeField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error: string | null
}) {
  const { t } = useI18n()
  return (
    <TextField
      id="profile-code"
      label={t('profile.code')}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      error={error}
      hint={env.useMockApi ? t('profile.demoCode', { code: MOCK_CODE }) : t('profile.codeHint')}
    />
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Confirm the current e-mail

export function ConfirmEmailDialog({
  open,
  onOpenChange,
  email,
  onConfirmed,
}: DialogProps & { email: string; onConfirmed: () => void }) {
  return (
    <Shell open={open} onOpenChange={onOpenChange}>
      {open && (
        <ConfirmEmailContent email={email} onConfirmed={onConfirmed} onClose={() => onOpenChange(false)} />
      )}
    </Shell>
  )
}

function ConfirmEmailContent({
  email,
  onConfirmed,
  onClose,
}: {
  email: string
  onConfirmed: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const { busy, error, run } = useAction()
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)

  async function send() {
    if ((await run(sendConfirmation)) !== null) setSent(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (code.length !== 6 || busy) return
    if ((await run(() => confirmCurrentEmail(code))) !== null) {
      onConfirmed()
      setDone(true)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('profile.email.confirm')}</DialogTitle>
        <DialogDescription>{sent ? t('profile.codeSent', { email }) : email}</DialogDescription>
      </DialogHeader>
      {done ? (
        <Done text={t('profile.email.confirmed')} onClose={onClose} />
      ) : !sent ? (
        <>
          <p className="text-muted-foreground text-sm">{t('profile.email.unverifiedText')}</p>
          <ErrorNote error={error} />
          <DialogFooter>
            <Button type="button" onClick={send} disabled={busy} className="w-full sm:w-auto">
              {busy && <LoaderCircle className="animate-spin" />}
              {t('profile.sendCode')}
            </Button>
          </DialogFooter>
        </>
      ) : (
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <CodeField
            value={code}
            onChange={setCode}
            error={touched && code.length !== 6 ? t('profile.codeShort') : null}
          />
          <ErrorNote error={error} />
          <Submit busy={busy} label={t('profile.email.confirm')} />
        </form>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Change the e-mail: new address + password, then the code sent to the new address

export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  onChanged,
}: DialogProps & { currentEmail: string; onChanged: (email: string) => void }) {
  return (
    <Shell open={open} onOpenChange={onOpenChange}>
      {open && (
        <ChangeEmailContent
          currentEmail={currentEmail}
          onChanged={onChanged}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Shell>
  )
}

function ChangeEmailContent({
  currentEmail,
  onChanged,
  onClose,
}: {
  currentEmail: string
  onChanged: (email: string) => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const { busy, error, run, clearError } = useAction()
  const [step, setStep] = useState<'address' | 'code'>('address')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [newEmail, setNewEmail] = useState<string | null>(null)

  const emailError = !email.trim()
    ? t('login.emailRequired')
    : !isEmail(email)
      ? t('login.emailInvalid')
      : null

  async function submitAddress(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (emailError || !password || busy) return
    if ((await run(() => requestEmailChange(email.trim(), password, currentEmail))) !== null) {
      setTouched(false)
      clearError()
      setStep('code')
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (code.length !== 6 || busy) return
    const result = await run(() => confirmEmailChange(code))
    if (result) {
      onChanged(result.value)
      setNewEmail(result.value)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('profile.email.change')}</DialogTitle>
        <DialogDescription>
          {step === 'code' ? t('profile.codeSent', { email: email.trim() }) : currentEmail}
        </DialogDescription>
      </DialogHeader>
      {newEmail ? (
        <Done text={t('profile.email.changed', { email: newEmail })} onClose={onClose} />
      ) : step === 'address' ? (
        <form className="grid gap-4" onSubmit={submitAddress} noValidate>
          <TextField
            id="profile-new-email"
            label={t('profile.email.new')}
            type="email"
            autoComplete="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={touched ? emailError : null}
          />
          <TextField
            id="profile-email-password"
            label={t('profile.currentPassword')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !password ? t('login.passwordRequired') : null}
          />
          <ErrorNote error={error} />
          <Submit busy={busy} label={t('profile.continue')} />
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={submitCode} noValidate>
          <CodeField
            value={code}
            onChange={setCode}
            error={touched && code.length !== 6 ? t('profile.codeShort') : null}
          />
          <ErrorNote error={error} />
          <Submit busy={busy} label={t('profile.email.change')} />
        </form>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Change the password

export function ChangePasswordDialog({ open, onOpenChange }: DialogProps) {
  return (
    <Shell open={open} onOpenChange={onOpenChange}>
      {open && <ChangePasswordContent onClose={() => onOpenChange(false)} />}
    </Shell>
  )
}

function ChangePasswordContent({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { busy, error, run } = useAction()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)

  const nextError =
    next.length < MIN_PASSWORD ? t('profile.passwordShort', { min: String(MIN_PASSWORD) }) : null
  const repeatError = repeat !== next ? t('profile.passwordMismatch') : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!current || nextError || repeatError || busy) return
    if ((await run(() => changePassword(current, next))) !== null) setDone(true)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('profile.password.change')}</DialogTitle>
      </DialogHeader>
      {done ? (
        <Done text={t('profile.password.changed')} onClose={onClose} />
      ) : (
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <TextField
            id="profile-current-password"
            label={t('profile.currentPassword')}
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            error={touched && !current ? t('login.passwordRequired') : null}
          />
          <TextField
            id="profile-new-password"
            label={t('profile.password.new')}
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={touched ? nextError : null}
          />
          <TextField
            id="profile-repeat-password"
            label={t('profile.password.repeat')}
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            error={touched ? repeatError : null}
          />
          <ErrorNote error={error} />
          <Submit busy={busy} label={t('profile.password.change')} />
        </form>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// Delete the account

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onDeleted,
}: DialogProps & { onDeleted: () => void }) {
  return (
    <Shell open={open} onOpenChange={onOpenChange}>
      {open && <DeleteAccountContent onDeleted={onDeleted} />}
    </Shell>
  )
}

function DeleteAccountContent({ onDeleted }: { onDeleted: () => void }) {
  const { t } = useI18n()
  const { busy, error, run } = useAction()
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!password || busy) return
    if ((await run(() => deleteAccount(password))) !== null) onDeleted()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('profile.delete')}</DialogTitle>
        <DialogDescription>{t('profile.delete.confirm')}</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <TextField
          id="profile-delete-password"
          label={t('profile.currentPassword')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched && !password ? t('login.passwordRequired') : null}
        />
        <ErrorNote error={error} />
        <Submit busy={busy} label={t('profile.delete')} destructive />
      </form>
    </>
  )
}

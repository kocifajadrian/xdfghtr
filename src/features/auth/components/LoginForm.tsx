import { useRef, useState, type FormEvent } from 'react'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { env } from '@/config/env'
import { useI18n, type MessageKey } from '@/i18n'
import { useAuth } from '../useAuth'
import { AuthError, DEMO_ACCOUNT } from '../api'
import { validateLogin, type LoginErrors } from '../validation'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { signIn } = useAuth()
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<MessageKey | null>(null)
  // The social provider the visitor tried (not connected yet), so the notice can be rebuilt on a language change.
  const [noticeProvider, setNoticeProvider] = useState('')
  const [loading, setLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setFormError(null)
    setNoticeProvider('')

    const found = validateLogin(email, password)
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()

    setLoading(true)
    try {
      await signIn(email, password, remember)
      onSuccess()
    } catch (err) {
      setFormError(err instanceof AuthError ? err.key : 'login.failed')
      setLoading(false)
      passwordRef.current?.focus()
    }
  }

  function onSocial(provider: string) {
    setFormError(null)
    setNoticeProvider(provider)
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => onSocial('Google')}>
          Google
        </Button>
        <Button type="button" variant="outline" onClick={() => onSocial('Facebook')}>
          Facebook
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        {t('login.or')}
        <Separator className="flex-1" />
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{t(formError)}</AlertDescription>
        </Alert>
      )}
      {noticeProvider && (
        <Alert role="status">
          <AlertDescription>{t('login.socialNotConnected', { provider: noticeProvider })}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="login-email">{t('login.email')}</Label>
        <Input
          id="login-email"
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="text-sm text-destructive">
            {t(errors.email)}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="login-password">{t('login.password')}</Label>
          <a
            href="#"
            className="ml-auto text-sm underline-offset-4 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {t('login.forgot')}
          </a>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            ref={passwordRef}
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            className="pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-muted-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {errors.password && (
          <p id="login-password-error" className="text-sm text-destructive">
            {t(errors.password)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="login-remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
        <Label htmlFor="login-remember">{t('login.remember')}</Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" />
            {t('login.submitting')}
          </>
        ) : (
          t('login.submit')
        )}
      </Button>

      <p className="text-center text-sm">
        {t('login.noAccount')}{' '}
        <a href="#" className="underline underline-offset-4" onClick={(e) => e.preventDefault()}>
          {t('login.register')}
        </a>
      </p>

      {env.useMockApi && (
        <p className="text-center text-xs text-muted-foreground">
          {t('login.demoAccount')} <code>{DEMO_ACCOUNT.email}</code> / <code>{DEMO_ACCOUNT.password}</code>
        </p>
      )}
    </form>
  )
}

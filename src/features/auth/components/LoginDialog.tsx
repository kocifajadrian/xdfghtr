import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/i18n'
import { LoginForm } from './LoginForm'

type Props = {
  open: boolean
  /** Page to go to after a successful login (the page the user tried to open). */
  next?: string
  onClose: () => void
}

/**
 * Login popup: the standard shadcn Dialog (Radix). It traps focus, closes on Esc or a click outside,
 * and its content is removed when closed, so every opening starts with an empty form.
 */
export function LoginDialog({ open, next, onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        ref={contentRef}
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => {
          // Start in the e-mail field instead of the first button.
          e.preventDefault()
          contentRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('login.title')}</DialogTitle>
          <DialogDescription>{next ? t('login.reason') : t('login.welcome')}</DialogDescription>
        </DialogHeader>
        <LoginForm
          onSuccess={() => {
            onClose()
            if (next) navigate(next)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

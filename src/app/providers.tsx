import type { ReactNode } from 'react'
import { AuthProvider, LoginDialogProvider } from '@/features/auth'
import { I18nProvider } from '@/i18n'

/** App-wide providers. The router is added around this in App.tsx (tests use a memory router instead). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <LoginDialogProvider>{children}</LoginDialogProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

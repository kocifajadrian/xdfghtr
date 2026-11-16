import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { detectLanguage, translate, type MessageKey } from '@/i18n'

type State = { failed: boolean }

/** Last safety net: a crash in any screen shows a message instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook for error reporting (for example Sentry) later.
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    // Sits outside the providers, so it reads the saved language directly instead of using the hook.
    const language = detectLanguage()
    const t = (key: MessageKey) => translate(language, key)
    return (
      <div role="alert" className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-xl font-semibold">{t('error.title')}</h1>
        <p className="text-muted-foreground">{t('error.text')}</p>
        <Button onClick={() => window.location.reload()}>{t('error.reload')}</Button>
      </div>
    )
  }
}

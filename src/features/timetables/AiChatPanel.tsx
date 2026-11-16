import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowUp, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { askAssistant, type ChatMessage } from './assistant'

/** Chat with the AI assistant. It replaces the search panel; the map stays. The conversation lives in the page. */
export function AiChatPanel({
  messages,
  onMessages,
  onBack,
  onShowSearch,
}: {
  messages: ChatMessage[]
  onMessages: (messages: ChatMessage[]) => void
  onBack: () => void
  onShowSearch: (search: { from: string; to: string }) => void
}) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [messages, busy])

  async function send(event: FormEvent) {
    event.preventDefault()
    const message = text.trim()
    if (!message || busy) return
    const history: ChatMessage[] = [...messages, { role: 'user', text: message }]
    onMessages(history)
    setText('')
    setBusy(true)
    try {
      const answer = await askAssistant(history)
      const reply =
        answer.text ??
        (answer.search
          ? t('tt.ai.found', { from: answer.search.from, to: answer.search.to })
          : t('tt.ai.unclear'))
      onMessages([...history, { role: 'assistant', text: reply, search: answer.search }])
    } catch {
      onMessages([...history, { role: 'assistant', text: t('tt.ai.failed') }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          {t('tt.ai.back')}
        </Button>
        <Badge variant="secondary">{t('tt.ai.beta')}</Badge>
      </div>
      <h2 className="flex items-center gap-2 text-base font-medium">
        <Sparkles className="size-4" aria-hidden="true" />
        {t('tt.ai.title')}
      </h2>

      <ul className="flex flex-col gap-2" aria-live="polite">
        <Bubble role="assistant">{t('tt.ai.welcome')}</Bubble>
        {messages.map((message, i) => (
          <Bubble key={i} role={message.role}>
            {message.text}
            {message.search && (
              <Button
                type="button"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onShowSearch(message.search!)}
              >
                {t('tt.ai.show')}
              </Button>
            )}
          </Bubble>
        ))}
        {busy && (
          <Bubble role="assistant">
            <span className="text-muted-foreground flex items-center gap-2">
              <Spinner /> {t('tt.ai.thinking')}
            </span>
          </Bubble>
        )}
      </ul>
      <div ref={end} />

      <form onSubmit={send}>
        <InputGroup>
          <InputGroupInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tt.ai.placeholder')}
            aria-label={t('tt.ai.placeholder')}
            autoComplete="off"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              size="icon-xs"
              variant="default"
              aria-label={t('tt.ai.send')}
              disabled={busy || !text.trim()}
            >
              <ArrowUp />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  )
}

function Bubble({ role, children }: { role: ChatMessage['role']; children: React.ReactNode }) {
  const mine = role === 'user'
  return (
    <li
      className={cn(
        'max-w-[88%] rounded-2xl px-3 py-2 text-sm',
        mine
          ? 'bg-primary text-primary-foreground self-end rounded-br-sm'
          : 'bg-muted self-start rounded-bl-sm',
      )}
    >
      {children}
    </li>
  )
}

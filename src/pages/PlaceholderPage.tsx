import type { ReactNode } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PlaceholderCard } from '@/components/PlaceholderCard'
import { useI18n, type MessageKey } from '@/i18n'

/** A screen that is not built yet. Each real screen replaces one of these in app/routes.tsx. */
export default function PlaceholderPage({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: MessageKey
  text: MessageKey
}) {
  const { t } = useI18n()
  return (
    <PageLayout className="flex items-center justify-center p-4">
      <PlaceholderCard icon={icon} title={t(title)} text={t(text)} />
    </PageLayout>
  )
}

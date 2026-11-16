import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PlaceholderCard } from '@/components/PlaceholderCard'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/navigation'
import { useI18n } from '@/i18n'

export default function NotFoundPage() {
  const { t } = useI18n()
  return (
    <PageLayout className="flex items-center justify-center p-4">
      <PlaceholderCard
        icon={<SearchX className="size-5" />}
        title={t('notFound.title')}
        text={t('notFound.text')}
        action={
          <Button asChild>
            <Link to={ROUTES.home}>{t('notFound.back')}</Link>
          </Button>
        }
      />
    </PageLayout>
  )
}

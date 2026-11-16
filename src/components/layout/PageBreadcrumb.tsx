import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useI18n } from '@/i18n'

export type Crumb = {
  label: string
  /** Missing = plain text (a page that does not exist yet, or the page we are on). The last one is always plain text. */
  to?: string
}

/** The path to the page, "Home > Profile > Orders". The last item is the page itself. */
export function PageBreadcrumb({ items }: { items: Crumb[] }) {
  const { t } = useI18n()
  return (
    <Breadcrumb aria-label={t('breadcrumb.label')}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

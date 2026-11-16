import type { ReactNode } from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

/** Placeholder content for screens that are not built yet. */
export function PlaceholderCard({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        {/* CardTitle is a plain <div>, so mark it as the page heading for screen readers. */}
        <CardTitle role="heading" aria-level={1} className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  )
}

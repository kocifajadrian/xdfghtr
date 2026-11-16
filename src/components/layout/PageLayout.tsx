import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SiteHeader } from './SiteHeader'

/** Page frame: header on top, content below. `className` styles the <main> area. */
export function PageLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className={cn('flex-1', className)}>{children}</main>
    </div>
  )
}

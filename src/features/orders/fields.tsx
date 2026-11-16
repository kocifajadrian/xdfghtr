import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** The browser's own list (works well with touch screens and keyboards), styled like the other fields. */
export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:ring-3',
        className,
      )}
      {...props}
    />
  )
}

export const Option = (props: ComponentProps<'option'>) => (
  <option className="bg-popover text-popover-foreground" {...props} />
)

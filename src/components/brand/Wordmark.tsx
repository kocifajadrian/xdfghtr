import { cn } from '@/lib/utils'

/** The "ubian" logo: lowercase Unbounded Medium in the theme's button colour. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'text-primary leading-none font-medium tracking-tight [font-family:"Unbounded_Variable",sans-serif]',
        className,
      )}
    >
      ubian
    </span>
  )
}

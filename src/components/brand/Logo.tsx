import { BrandMark } from '@/components/brand/BrandMark'
import { Wordmark } from '@/components/brand/Wordmark'
import { cn } from '@/lib/utils'

/** Mark followed by the wordmark. Size it with a text-* class; the mark scales with the text. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex items-center gap-[0.2em] leading-none', className)}>
      <BrandMark className={markClassName} />
      <Wordmark />
    </span>
  )
}

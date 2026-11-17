import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * The Ubian mark: two identical half-circle "U" hairpins (centre-line radius 36, 16 wide, 45° arms)
 * offset sideways and joined by two flat top bars. Drawn from that geometry, not traced, so every edge
 * is exact. Drawn in currentColor so it follows the theme (text-primary by default).
 */
export function BrandMark({ className }: { className?: string }) {
  const clip = `mark${useId().replace(/:/g, '')}`
  return (
    <svg
      aria-hidden
      viewBox="40 30 197 134"
      className={cn('text-primary aspect-[197/134] h-[1.1em] shrink-0', className)}
    >
      <defs>
        <clipPath id={clip}>
          <path d="M75.5 30.5H400V400H-100V81.5H126.5Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} fill="none" stroke="currentColor" strokeWidth={16}>
        <path d="M45.54 74.96L115.54 144.96A36 36 0 0 0 166.46 94.04L71.46 -0.96" />
        <path d="M96.04 74.96L166.04 144.96A36 36 0 0 0 216.96 94.04L121.96 -0.96" />
      </g>
      <path fill="currentColor" d="M40.78 81.5H113.9L129.9 97.5H56.78ZM91.6 30.5H164.72L180.72 46.5H107.6Z" />
    </svg>
  )
}

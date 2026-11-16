import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Language } from '@/i18n'

// Small inline SVG flags. Emoji flags are not used: Windows shows them as the letters "SK" / "PL".

const FLAGS: Record<Language, ReactNode> = {
  sk: (
    <>
      <rect width="24" height="5.34" fill="#fff" />
      <rect y="5.33" width="24" height="5.34" fill="#0b4ea2" />
      <rect y="10.66" width="24" height="5.34" fill="#ee1c25" />
      {/* Coat of arms: red shield, white double cross, blue hills. */}
      <path
        d="M5.2 3.6h6.4v4.9c0 2.3-1.7 3.6-3.2 4.2-1.5-.6-3.2-1.9-3.2-4.2z"
        fill="#ee1c25"
        stroke="#fff"
        strokeWidth=".7"
      />
      <path d="M8.4 5v5.2M7 6.2h2.8M7.3 7.6h2.2" stroke="#fff" strokeWidth=".7" />
      <path
        d="M5.6 10c.9-.7 1.6-1.3 2.8-1.3s1.9.6 2.8 1.3c-.5 1.1-1.5 1.9-2.8 2.5-1.3-.6-2.3-1.4-2.8-2.5z"
        fill="#0b4ea2"
      />
    </>
  ),
  de: (
    <>
      <rect width="24" height="5.34" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#dd0000" />
      <rect y="10.66" width="24" height="5.34" fill="#ffce00" />
    </>
  ),
  uk: (
    <>
      <rect width="24" height="8" fill="#0057b7" />
      <rect y="8" width="24" height="8" fill="#ffd700" />
    </>
  ),
  hu: (
    <>
      <rect width="24" height="5.34" fill="#ce2939" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
      <rect y="10.66" width="24" height="5.34" fill="#477050" />
    </>
  ),
  pl: (
    <>
      <rect width="24" height="8" fill="#fff" />
      <rect y="8" width="24" height="8" fill="#dc143c" />
    </>
  ),
  en: (
    // Union Jack, drawn in a 60x40 box and squeezed into the common 3:2 flag shape.
    <svg viewBox="0 0 60 40" width="24" height="16" preserveAspectRatio="none">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" strokeWidth="3" />
      <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0V40M0 20H60" stroke="#c8102e" strokeWidth="8" />
    </svg>
  ),
}

/** The flag of a language, as a small rounded picture. Decorative: the language name is always written next to it. */
export function Flag({ language, className }: { language: Language; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-foreground/15',
        className,
      )}
    >
      <svg viewBox="0 0 24 16" width="24" height="16" className="block size-full">
        {FLAGS[language]}
      </svg>
    </span>
  )
}

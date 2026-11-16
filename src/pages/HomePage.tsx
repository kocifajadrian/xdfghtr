import type { ReactNode } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { useAuth, useLoginDialog } from '@/features/auth'
import { Reveal } from '@/features/home/Reveal'
import { SlovakiaMap } from '@/features/home/SlovakiaMap'
import { CardVisual, SearchVisual } from '@/features/home/Visuals'
import { useI18n, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'

type Section = { title: MessageKey; text: MessageKey; visual?: ReactNode }

// Sections alternate: the visual on the right, then on the left.
const SECTIONS: Section[] = [
  { title: 'home.schedules.title', text: 'home.schedules.text', visual: <SearchVisual /> },
  { title: 'home.card.title', text: 'home.card.text', visual: <CardVisual /> },
  // These have no picture yet: they are text only.
  { title: 'home.student.title', text: 'home.student.text' },
  { title: 'home.parking.title', text: 'home.parking.text' },
  { title: 'home.green.title', text: 'home.green.text' },
]

/** Shows a text where **word** is written in bold. */
function Bold({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="text-primary font-extrabold">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

/** The heading and the text of a section. */
function SectionText({ title, text, className }: { title: string; text: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
      <p className="text-muted-foreground mt-2 leading-relaxed">{text}</p>
    </div>
  )
}

/** Landing page: the whole page scrolls (the header stays on top), one zig-zag section per feature. */
export default function HomePage() {
  const { user } = useAuth()
  const { openLogin } = useLoginDialog()
  const { t } = useI18n()

  return (
    <PageLayout>
      {/* Hero: the map is big and sits behind the text, which is laid over its empty corner (stacked on phones, text
          first). A soft glow of the main colour lies under the map, and a few glass cards float on it. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative isolate mx-auto w-full max-w-[1000px] px-4 pt-10 pb-6 md:min-h-[min(40rem,calc(100svh-3rem))] md:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(55%_65%_at_68%_55%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_72%)]"
          />
          {/* Keeps the text readable where the map lines run behind it. */}
          <div
            aria-hidden
            className="from-background via-background/85 pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[48%] bg-gradient-to-r to-transparent md:block"
          />
          <div className="relative z-10 flex max-w-md flex-col items-start text-left">
            <h1 className="text-primary text-6xl leading-none font-medium tracking-tight sm:text-7xl [font-family:'Unbounded_Variable',sans-serif]">
              ubian
            </h1>
            <p className="mt-4 text-2xl leading-tight font-semibold text-balance sm:text-4xl">
              <Bold text={t('home.tagline')} />
            </p>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm text-balance sm:text-base">
              {t('home.intro')}
            </p>
            {!user && (
              <div className="mt-6 flex items-center gap-2">
                <Button size="lg" onClick={() => openLogin()}>
                  {t('header.signIn')}
                </Button>
                <Button size="lg" variant="outline" onClick={() => openLogin()}>
                  {t('login.register')}
                </Button>
              </div>
            )}
          </div>

          <SlovakiaMap className="pointer-events-none mt-8 block w-full md:absolute md:right-0 md:bottom-0 md:mt-0 md:w-[94%]" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1000px] px-4">
        {SECTIONS.map((section, i) =>
          section.visual ? (
            <section
              key={section.title}
              className="grid items-center gap-5 py-6 md:grid-cols-2 md:gap-10 md:py-8"
            >
              {/* Even sections: visual on the left (first in the grid). Odd: text first. On phones the text is always first. */}
              <Reveal className={cn(i % 2 === 0 ? 'order-2 md:order-1' : 'order-2')}>{section.visual}</Reveal>
              <Reveal delay={100} className={cn(i % 2 === 0 ? 'order-1 md:order-2' : 'order-1')}>
                <SectionText title={t(section.title)} text={t(section.text)} />
              </Reveal>
            </section>
          ) : (
            // No picture yet: the text alone, zig-zagging like the others (even sections on the right, odd on the left).
            <section key={section.title} className="grid gap-5 py-12 md:grid-cols-2 md:gap-10 md:py-20">
              <Reveal className={cn(i % 2 === 0 && 'md:col-start-2')}>
                <SectionText title={t(section.title)} text={t(section.text)} />
              </Reveal>
            </section>
          ),
        )}
      </div>
    </PageLayout>
  )
}

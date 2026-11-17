import type { ReactNode } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { useAuth, useLoginDialog } from '@/features/auth'
import { QuickLinks } from '@/features/home/QuickLinks'
import { SearchPanel } from '@/features/home/SearchPanel'
import { Reveal } from '@/features/home/Reveal'
import { SlovakiaMap } from '@/features/home/SlovakiaMap'
import { CardVisual } from '@/features/home/Visuals'
import { useI18n, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/brand/BrandMark'

type Section = { id: string; title: MessageKey; text: MessageKey; visual?: ReactNode }

// Sections alternate: the visual on the right, then on the left.
const SECTIONS: Section[] = [
  {
    id: 'cestovne-poriadky',
    title: 'home.schedules.title',
    text: 'home.schedules.text',
    visual: <SearchPanel />,
  },
  { id: 'dopravna-karta', title: 'home.card.title', text: 'home.card.text', visual: <CardVisual /> },
  // These have no picture yet: they are text only.
  { id: 'preukaz', title: 'home.student.title', text: 'home.student.text' },
  { id: 'parkovanie', title: 'home.parking.title', text: 'home.parking.text' },
  { id: 'zelene-kilometre', title: 'home.green.title', text: 'home.green.text' },
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
      {/* Hero: the map is big and sits behind the text, which is laid over its empty corner (stacked on phones: text, quick links, then the map tucked up behind them). The country glows along its outline, and a few glass cards float on it. */}
      <section className="relative isolate overflow-hidden">
        <div className="relative isolate mx-auto flex w-full max-w-[1000px] flex-col px-4 pt-10 pb-6 sm:block sm:min-h-[40rem] sm:pt-20">
          {/* Keeps the text readable where the map lines run behind it. It stops below the text, so the south-west of the map (Bratislava) stays clear. */}
          <div
            aria-hidden
            className="from-background via-background/85 pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[48%] bg-gradient-to-r to-transparent [mask-image:linear-gradient(to_bottom,black_60%,transparent_78%)] sm:block"
          />
          {/* On a phone the pieces are stacked in this order: text, quick links, map (the wrapper "disappears" so they can be
              ordered). From sm up, the text and the quick links stay together in the left column and the map is behind. */}
          <div className="relative z-10 max-sm:contents sm:flex sm:max-w-md sm:flex-col sm:items-start sm:text-left">
            <div className="flex flex-col items-start text-left max-sm:relative max-sm:z-10 max-sm:order-1">
              <h1
                className={cn(
                  'text-primary flex items-center gap-[0.15em] text-6xl leading-none font-medium tracking-tight sm:text-7xl [font-family:"Unbounded_Variable",sans-serif]',
                )}
              >
                <BrandMark />
                ubian
              </h1>
              <p className="mt-4 text-2xl leading-tight font-semibold text-balance sm:text-4xl">
                <Bold text={t('home.tagline')} />
              </p>
              <p className="text-muted-foreground mt-4 max-w-sm text-sm text-balance sm:text-base">
                {t('home.intro')}
              </p>
              {!user && (
                <div className="mt-4 flex items-center gap-2">
                  <Button size="lg" onClick={() => openLogin()}>
                    {t('header.signIn')}
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => openLogin()}>
                    {t('login.register')}
                  </Button>
                </div>
              )}
            </div>
            <div className="relative z-10 max-sm:order-2">
              <QuickLinks />
            </div>
          </div>

          {/* On a phone the map comes after the quick links and is tucked up behind them, fading in from the top. From sm up
              the wrapper disappears and the map is the absolute background. */}
          <div className="relative max-sm:order-3 max-sm:-mt-5 sm:contents">
            <div
              aria-hidden
              className="from-background pointer-events-none absolute inset-x-0 top-0 z-[1] h-10 bg-gradient-to-b to-transparent sm:hidden"
            />
            <SlovakiaMap className="pointer-events-none block w-full sm:absolute sm:right-0 sm:bottom-0 sm:w-[94%]" />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1000px] px-4">
        {SECTIONS.map((section, i) =>
          section.visual ? (
            <section
              key={section.title}
              id={section.id}
              className="grid scroll-mt-16 items-center gap-5 py-6 md:grid-cols-2 md:gap-10 md:py-8"
            >
              {/* Even sections: visual on the left (first in the grid). Odd: text first. On phones the text is always first. */}
              <Reveal className={cn(i % 2 === 0 ? 'order-2 md:order-1' : 'order-2')}>{section.visual}</Reveal>
              <Reveal delay={100} className={cn(i % 2 === 0 ? 'order-1 md:order-2' : 'order-1')}>
                <SectionText title={t(section.title)} text={t(section.text)} />
              </Reveal>
            </section>
          ) : (
            // No picture yet: the text alone, zig-zagging like the others (even sections on the right, odd on the left).
            <section
              key={section.title}
              id={section.id}
              className="grid scroll-mt-16 gap-5 py-12 md:grid-cols-2 md:gap-10 md:py-20"
            >
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

import { useState, type CSSProperties, type ReactNode } from 'react'
import { EDGES, MAP_HEIGHT, MAP_WIDTH, REGION_PATHS, TOWNS } from './slovakia-data'

/**
 * Hero background: a custom SVG map of Slovakia with a web of train and bus links between towns.
 * The regions are softly filled. The web grows out of Žilina like a wave, slowly: a link starts drawing when the wave
 * reaches one of its towns, and every town lights up on arrival. When two growing links meet, both stop where they meet,
 * so the result is one seamless web. It stays for a while, then fades and starts again.
 * Pure SVG (SMIL animations), no map library or network requests. With reduced motion it plays once and stays.
 * An older version with a camera that dives in and follows one trip, faster and slower timings, running dots and rings
 * is kept in backups/SlovakiaMap.motions.tsx.
 */

// One solid colour for the outline, routes and dots: the map colour (--map in index.css), which is the same as its
// buttons. It is NOT drawn see-through, so where lines and dots cross the colour is the same everywhere.
const COLOR = 'var(--map)'
const WIDTH = 3 // width of the routes and the outline
const DOT = 5.5 // radius of a town dot
const SPEED = 100 // map units per second
// A piece waiting for its wave is pushed a hair into the gap, so its round line end is not drawn as a speck.
const HIDDEN = 0.01
const START = 0.6 // seconds before the wave leaves the source
const PAUSE = 7 // seconds the finished web stays on screen
const SOURCE = 0 // Žilina
// Only these towns show their name; every town still gets a dot. Empty = dots only.
const LABELLED = new Set(['Žilina', 'Bratislava', 'Trnava', 'Trenčín', 'Poprad', 'Košice', 'Banská Bystrica'])

const PAD = 40 // room around the whole map, so the outline is not cut off or faded at the edge
const VIEW_W = MAP_WIDTH + 2 * PAD
const VIEW_H = (VIEW_W * MAP_HEIGHT) / MAP_WIDTH
const VIEW_BOX = `${-PAD} ${((-PAD * MAP_HEIGHT) / MAP_WIDTH).toFixed(1)} ${VIEW_W} ${VIEW_H.toFixed(1)}`

// The edges of the picture fade out instead of ending in a hard line.
const EDGE_FADE: CSSProperties = {
  maskImage:
    'linear-gradient(to right, transparent, black 6%, black 94%, transparent), linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)',
  maskComposite: 'intersect',
  WebkitMaskImage:
    'linear-gradient(to right, transparent, black 6%, black 94%, transparent), linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)',
  WebkitMaskComposite: 'source-in',
}

// The light along the shape of the country: a close glow and two wider, softer ones that reach out into the empty space,
// all in the map colour. It sits on a wrapper around the svg, not on the svg itself, so the svg's edge does not cut it off.
const glow = (pct: number) => `color-mix(in oklab, var(--map) ${pct}%, transparent)`
const OUTLINE_GLOW: CSSProperties = {
  filter: `drop-shadow(0 0 6px ${glow(50)}) drop-shadow(0 0 22px ${glow(24)}) drop-shadow(0 0 50px ${glow(10)})`,
}

// 1. When each town is first reached: the shortest travel time from the source over the links (Dijkstra).
const arrival = TOWNS.map((_, i) => (i === SOURCE ? START : Infinity))
{
  const visited = new Set<number>()
  for (let step = 0; step < TOWNS.length; step++) {
    let u = -1
    arrival.forEach((t, i) => {
      if (!visited.has(i) && t !== Infinity && (u === -1 || t < arrival[u]!)) u = i
    })
    if (u === -1) break
    visited.add(u)
    for (const e of EDGES) {
      const v = e.a === u ? e.b : e.b === u ? e.a : -1
      if (v !== -1) arrival[v] = Math.min(arrival[v]!, arrival[u]! + e.length / SPEED)
    }
  }
}

/**
 * The outline of the whole country: the region borders minus the ones two regions share. A border piece used by only one
 * region is on the outside. The pieces are joined into long lines again so they draw cleanly.
 */
function outerBorder(paths: string[]): string {
  const used = new Map<string, { a: string; b: string; count: number }>()
  const rings: [number, number][][] = []
  for (const d of paths) {
    const n = d.match(/-?\d+(?:\.\d+)?/g)!
    const pts: string[] = []
    const ring: [number, number][] = []
    for (let i = 0; i < n.length; i += 2) {
      pts.push(`${n[i]} ${n[i + 1]}`)
      ring.push([Number(n[i]), Number(n[i + 1])])
    }
    rings.push(ring)
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i]!
      const b = pts[i + 1]!
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      const piece = used.get(key)
      if (piece) piece.count++
      else used.set(key, { a, b, count: 1 })
    }
  }
  // Pieces on the outside, listed by the point they touch.
  const next = new Map<string, { to: string; key: string }[]>()
  // Neighbouring regions do not always share exactly the same points, so some inner borders look "unshared". A piece
  // is only really on the outside if one side of it, a little way off, is outside every region.
  const inside = (x: number, y: number) =>
    rings.some((ring) => {
      let hit = false
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i]!
        const [xj, yj] = ring[j]!
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
      }
      return hit
    })
  const onOutside = (a: string, b: string) => {
    const [x1, y1] = a.split(' ').map(Number) as [number, number]
    const [x2, y2] = b.split(' ').map(Number) as [number, number]
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const nx = (-(y2 - y1) / len) * 2.5
    const ny = ((x2 - x1) / len) * 2.5
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    return !inside(mx + nx, my + ny) || !inside(mx - nx, my - ny)
  }
  for (const [key, p] of used) {
    if (p.count > 1 || !onOutside(p.a, p.b)) continue
    next.set(p.a, [...(next.get(p.a) ?? []), { to: p.b, key }])
    next.set(p.b, [...(next.get(p.b) ?? []), { to: p.a, key }])
  }
  const done = new Set<string>()
  const lines: string[] = []
  for (const start of next.keys()) {
    for (;;) {
      let at = start
      const line = [at]
      for (;;) {
        const step = next.get(at)?.find((e) => !done.has(e.key))
        if (!step) break
        done.add(step.key)
        at = step.to
        line.push(at)
      }
      if (line.length < 2) break
      // A real border is long. A leftover of one or two pieces is a stray bit of an inner border: leave it out.
      if (line.length >= 4) lines.push(`M${line.join('L')}`)
    }
  }
  return lines.join('')
}
const COUNTRY_OUTLINE = outerBorder(REGION_PATHS)

/** The same path drawn the other way round ("M x y L x y ..." in, same format out). */
function reversePath(d: string) {
  const n = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number)
  const points: string[] = []
  for (let i = n.length - 2; i >= 0; i -= 2) points.push(`${n[i]} ${n[i + 1]}`)
  return `M${points.join('L')}`
}

// 2. Every link grows from each end that gets reached. If the far town was reached first by another link, the two
// meet in the middle (where they arrive at the same moment) and both stop there.
type Piece = { d: string; share: number; start: number; end: number }
const pieces: Piece[] = EDGES.flatMap((e): Piece[] => {
  const fromA = arrival[e.a]! <= arrival[e.b]!
  const [u, v] = fromA ? [e.a, e.b] : [e.b, e.a]
  const dU = fromA ? e.path : reversePath(e.path)
  const dV = fromA ? reversePath(e.path) : e.path
  const tu = arrival[u]!
  const tv = arrival[v]!
  const meet = Math.min(e.length, Math.max(0, (e.length + SPEED * (tv - tu)) / 2)) // distance from u
  const out: Piece[] = [{ d: dU, share: meet / e.length, start: tu, end: tu + meet / SPEED }]
  if (e.length - meet > 0.5) {
    out.push({ d: dV, share: (e.length - meet) / e.length, start: tv, end: tv + (e.length - meet) / SPEED })
  }
  return out
})

const CYCLE = Math.max(...pieces.map((p) => p.end)) + PAUSE
const frac = (seconds: number) => +(seconds / CYCLE).toFixed(4)
/** Fraction of the loop where everything fades out, just before it restarts. */
const FADE = 0.94

/** Shows its children from `at` seconds until the end of the loop, then fades them. */
function From({ at, once, children }: { at: number; once: boolean; children: ReactNode }) {
  const t = frac(at)
  return (
    <g opacity="0">
      {children}
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount={once ? 1 : 'indefinite'}
        fill="freeze"
        values={once ? '0;0;1;1;1' : '0;0;1;1;0'}
        keyTimes={`0;${t};${Math.min(t + 0.02, FADE - 0.01)};${FADE};1`}
      />
    </g>
  )
}

export function SlovakiaMap({ className }: { className?: string }) {
  // Visitors who ask for less motion get one run that stops on the finished map, not an endless loop.
  const [once] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const loop = { repeatCount: once ? 1 : 'indefinite', fill: 'freeze' } as const
  const fadeOut = !once && (
    <animate
      attributeName="opacity"
      dur={`${CYCLE}s`}
      repeatCount="indefinite"
      values="1;1;0"
      keyTimes={`0;${FADE};1`}
    />
  )

  return (
    <div className={className} style={OUTLINE_GLOW} aria-hidden="true">
      <svg viewBox={VIEW_BOX} className="block w-full overflow-hidden" style={EDGE_FADE}>
        {/* The regions, each softly filled in a slightly different strength, with thin borders. */}
        <g strokeLinejoin="round">
          {REGION_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={COLOR}
              fillOpacity={0.05 + (i % 3) * 0.04}
              stroke={COLOR}
              strokeOpacity="0.3"
              strokeWidth="1.4"
            />
          ))}
        </g>

        {/* Outline: only the border of the whole country, drawn like the routes (same solid colour and width), so the
          routes and the outline together make the shape of Slovakia. */}
        <g fill="none" stroke={COLOR} strokeWidth={WIDTH} strokeLinejoin="round" strokeLinecap="round">
          <path d={COUNTRY_OUTLINE} />
        </g>

        {/* The web: solid lines that grow along the links. */}
        <g fill="none" stroke={COLOR} strokeLinejoin="round" strokeLinecap="round">
          {pieces.map((piece, i) => (
            <path
              key={i}
              d={piece.d}
              pathLength={1}
              strokeDasharray={`${piece.share} 2`}
              strokeDashoffset={piece.share + HIDDEN}
              strokeWidth={WIDTH}
            >
              <animate
                attributeName="stroke-dashoffset"
                dur={`${CYCLE}s`}
                {...loop}
                values={`${piece.share + HIDDEN};${piece.share + HIDDEN};0;0`}
                keyTimes={`0;${frac(piece.start)};${frac(piece.end)};1`}
              />
              {fadeOut}
            </path>
          ))}
        </g>

        {/* Towns: a dot appears when the wave arrives (nothing before that), with the name next to it for the towns in
          LABELLED (names only on wide screens). */}
        {TOWNS.map((town, i) => (
          <g key={town.name} transform={`translate(${town.x} ${town.y})`}>
            <From at={arrival[i]!} once={once}>
              <circle r={DOT} fill={COLOR} />
              {LABELLED.has(town.name) && (
                <text x={DOT + 4} y="4.8" fontSize="14" className="fill-foreground/70 hidden md:block">
                  {town.name}
                </text>
              )}
            </From>
          </g>
        ))}
      </svg>
    </div>
  )
}

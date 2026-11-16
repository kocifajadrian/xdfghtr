import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { EDGES, MAP_HEIGHT, MAP_WIDTH, REGION_PATHS, TOWNS } from './slovakia-data'

/**
 * Hero background: a custom SVG map of Slovakia with a web of train and bus links between towns.
 * The loop starts zoomed in: the camera dives to Bratislava and follows one trip (Bratislava, Trnava, Trenčín, Žilina,
 * Poprad, Košice), then pulls back and the web grows out of Žilina like a wave: a link starts drawing when the first trip
 * reaches one of its towns, and every town lights up on arrival. When two growing links meet, both stop where they meet,
 * so the result is one seamless web. Then it fades and starts again.
 * Pure SVG (SMIL animations), no map library or network requests. With reduced motion the whole thing, camera included,
 * plays once and stays.
 */

// One solid colour for the outline, routes and dots: the map colour (--map in index.css), which is the same as its
// buttons. It is NOT drawn see-through, so where lines and dots cross the colour is the same everywhere.
const COLOR = 'var(--map)'
const SPEED = 180 // map units per second
// A piece waiting for its trip is pushed a hair into the gap, so its round line end is not drawn as a speck.
const HIDDEN = 0.01
const PAUSE = 3.5 // seconds the finished web stays on screen
const SOURCE = 0 // Žilina
// Only these towns show their name; every town still gets a dot. Empty = dots only.
const LABELLED = new Set(['Žilina', 'Bratislava', 'Trnava', 'Trenčín', 'Poprad', 'Košice', 'Banská Bystrica'])

// ---- Opening tour ------------------------------------------------------------------------------------------------
// The loop starts zoomed in: the camera dives to Bratislava and follows one trip across the country, then pulls back
// and the web of all links grows as before. To go back to the old look (no zoom), restore backups/SlovakiaMap.classic.tsx.
const TOUR = [1, 2, 5, 0, 10, 12] // Bratislava, Trnava, Trenčín, Žilina, Poprad, Košice (indexes into TOWNS)
const TOUR_SPEED = 110 // map units per second while the camera follows the trip
const ZOOM = 2.2 // how far the camera is zoomed in on the trip
const ZOOM_IN = 1.6 // seconds the camera takes to dive from the whole map to Bratislava
const ZOOM_OUT = 2.4 // seconds the camera takes to pull back to the whole map
const PAD = 40 // room around the whole map, so the outline is not cut off or faded at the edge
type View = { x: number; y: number; w: number; h: number }
const FULL: View = {
  x: -PAD,
  y: (-PAD * MAP_HEIGHT) / MAP_WIDTH,
  w: MAP_WIDTH + 2 * PAD,
  h: ((MAP_WIDTH + 2 * PAD) * MAP_HEIGHT) / MAP_WIDTH,
}

/** The quickest way over the links from one town to another: each link, and whether it is walked from a to b. */
function shortestRoute(from: number, to: number) {
  const dist = TOWNS.map((_, i) => (i === from ? 0 : Infinity))
  const via: ({ edge: number; forward: boolean; prev: number } | undefined)[] = TOWNS.map(() => undefined)
  const done = new Set<number>()
  for (;;) {
    let u = -1
    dist.forEach((d, i) => {
      if (!done.has(i) && d !== Infinity && (u === -1 || d < dist[u]!)) u = i
    })
    if (u === -1 || u === to) break
    done.add(u)
    EDGES.forEach((e, k) => {
      if (e.a !== u && e.b !== u) return
      const forward = e.a === u
      const v = forward ? e.b : e.a
      if (dist[u]! + e.length < dist[v]!) {
        dist[v] = dist[u]! + e.length
        via[v] = { edge: k, forward, prev: u }
      }
    })
  }
  const steps: { edge: number; forward: boolean }[] = []
  for (let at = to; at !== from;) {
    const step = via[at]!
    steps.unshift({ edge: step.edge, forward: step.forward })
    at = step.prev
  }
  return steps
}

// The trip as one long line: its points, and how far along it each town is reached.
const tourPoints: [number, number][] = [[TOWNS[TOUR[0]!]!.x, TOWNS[TOUR[0]!]!.y]]
const tourDistance: number[] = [0] // distance along the line at each point
const tourReached = new Map<number, number>([[TOUR[0]!, 0]]) // town -> distance along the line when reached
for (let k = 1; k < TOUR.length; k++) {
  for (const step of shortestRoute(TOUR[k - 1]!, TOUR[k]!)) {
    const edge = EDGES[step.edge]!
    const n = edge.path.match(/-?\d+(?:\.\d+)?/g)!.map(Number)
    const points: [number, number][] = []
    for (let i = 0; i < n.length; i += 2) points.push([n[i]!, n[i + 1]!])
    if (!step.forward) points.reverse()
    for (const p of points.slice(1)) {
      const last = tourPoints[tourPoints.length - 1]!
      tourPoints.push(p)
      tourDistance.push(tourDistance[tourDistance.length - 1]! + Math.hypot(p[0] - last[0], p[1] - last[1]))
    }
    const end = step.forward ? edge.b : edge.a
    if (!tourReached.has(end)) tourReached.set(end, tourDistance[tourDistance.length - 1]!)
  }
}
const tourLength = tourDistance[tourDistance.length - 1]!
const TOUR_TIME = tourLength / TOUR_SPEED
const tourPath = `M${tourPoints.map((p) => `${p[0]} ${p[1]}`).join('L')}`
/** The moment the whole web starts: after the camera has pulled back. */
const START = ZOOM_IN + TOUR_TIME + ZOOM_OUT + 0.4

/** Where the head of the trip is, `s` map units along the line. */
function tourHead(s: number): [number, number] {
  const d = Math.min(Math.max(s, 0), tourLength)
  let i = 1
  while (i < tourDistance.length - 1 && tourDistance[i]! < d) i++
  const from = tourPoints[i - 1]!
  const to = tourPoints[i]!
  const span = tourDistance[i]! - tourDistance[i - 1]! || 1
  const t = (d - tourDistance[i - 1]!) / span
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]
}

/** The camera frame centred on a point, kept inside the map. */
function frameAround(cx: number, cy: number): View {
  const w = MAP_WIDTH / ZOOM
  const h = MAP_HEIGHT / ZOOM
  return {
    x: Math.min(Math.max(cx - w / 2, FULL.x), FULL.x + FULL.w - w),
    y: Math.min(Math.max(cy - h / 2, FULL.y), FULL.y + FULL.h - h),
    w,
    h,
  }
}

/** The camera follows the head of the trip, a little behind and ahead, so it glides instead of jerking at corners. */
function followHead(s: number): View {
  let x = 0
  let y = 0
  const offsets = [-120, -80, -40, 0, 40, 80, 120]
  for (const o of offsets) {
    const [px, py] = tourHead(s + o)
    x += px
    y += py
  }
  return frameAround(x / offsets.length, y / offsets.length)
}

const ease = (t: number) => t * t * (3 - 2 * t)
const mix = (a: View, b: View, t: number): View => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
})

// The camera: whole map, dive in to Bratislava, follow the trip, pull back out to the whole map.
const cameraKeys: { t: number; view: View }[] = [{ t: 0, view: FULL }]
{
  const start = followHead(0)
  for (let i = 1; i <= 8; i++) cameraKeys.push({ t: (ZOOM_IN * i) / 8, view: mix(FULL, start, ease(i / 8)) })
  for (let t = 0.25; t < TOUR_TIME; t += 0.25) {
    cameraKeys.push({ t: ZOOM_IN + t, view: followHead(t * TOUR_SPEED) })
  }
  const end = followHead(tourLength)
  cameraKeys.push({ t: ZOOM_IN + TOUR_TIME, view: end })
  for (let i = 1; i <= 8; i++) {
    cameraKeys.push({ t: ZOOM_IN + TOUR_TIME + (ZOOM_OUT * i) / 8, view: mix(end, FULL, ease(i / 8)) })
  }
}
const viewText = (v: View) => `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`

// While the camera is zoomed in, the edges of the picture fade out instead of ending in a hard line.
const EDGE_FADE: CSSProperties = {
  maskImage:
    'linear-gradient(to right, transparent, black 6%, black 94%, transparent), linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)',
  maskComposite: 'intersect',
  WebkitMaskImage:
    'linear-gradient(to right, transparent, black 6%, black 94%, transparent), linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)',
  WebkitMaskComposite: 'source-in',
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

  return (
    <svg
      viewBox={viewText(FULL)}
      className={cn('overflow-hidden', className)}
      style={EDGE_FADE}
      aria-hidden="true"
    >
      {/* The camera: the visible part of the map changes over time (zoom in, follow the trip, zoom out). Visitors who ask
          for less motion get it once, not in a loop. */}
      <animate
        attributeName="viewBox"
        dur={`${CYCLE}s`}
        {...loop}
        values={[...cameraKeys.map((k) => viewText(k.view)), viewText(FULL)].join(';')}
        keyTimes={[...cameraKeys.map((k) => frac(k.t)), 1].join(';')}
      />

      {/* Outline: only the border of the whole country, drawn like the routes (same solid colour and width), so the
          routes and the outline together make the shape of Slovakia. The borders between regions are not drawn. */}
      <g fill="none" stroke={COLOR} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d={COUNTRY_OUTLINE} />
      </g>

      {/* The tour: the one trip the camera follows, drawn as it goes. */}
      <g fill="none" stroke={COLOR} strokeLinejoin="round" strokeLinecap="round">
        <path d={tourPath} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 + HIDDEN} strokeWidth="4">
          <animate
            attributeName="stroke-dashoffset"
            dur={`${CYCLE}s`}
            {...loop}
            values={`${1 + HIDDEN};${1 + HIDDEN};0;0`}
            keyTimes={`0;${frac(ZOOM_IN)};${frac(ZOOM_IN + TOUR_TIME)};1`}
          />
          {!once && (
            <animate
              attributeName="opacity"
              dur={`${CYCLE}s`}
              repeatCount="indefinite"
              values="1;1;0"
              keyTimes={`0;${FADE};1`}
            />
          )}
        </path>
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
            strokeWidth="4"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur={`${CYCLE}s`}
              {...loop}
              values={`${piece.share + HIDDEN};${piece.share + HIDDEN};0;0`}
              keyTimes={`0;${frac(piece.start)};${frac(piece.end)};1`}
            />
            {!once && (
              <animate
                attributeName="opacity"
                dur={`${CYCLE}s`}
                repeatCount="indefinite"
                values="1;1;0"
                keyTimes={`0;${FADE};1`}
              />
            )}
          </path>
        ))}
      </g>

      {/* Towns: a dot appears when the first trip arrives (nothing before that), with the name next to it for the towns in LABELLED (names only on wide screens). */}
      {TOWNS.map((town, i) => (
        <g key={town.name} transform={`translate(${town.x} ${town.y})`}>
          <From
            at={Math.min(
              arrival[i]!,
              tourReached.has(i) ? ZOOM_IN + tourReached.get(i)! / TOUR_SPEED : Infinity,
            )}
            once={once}
          >
            <circle r="6.5" fill={COLOR} />
            {LABELLED.has(town.name) && (
              <text x="10" y="4.8" fontSize="14" className="fill-foreground/70 hidden md:block">
                {town.name}
              </text>
            )}
          </From>
        </g>
      ))}
    </svg>
  )
}

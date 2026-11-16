import { useEffect, useRef, useState } from 'react'
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useDark } from '@/lib/use-dark'
import { arrival, departure, firstStop, lastStop } from './time'
import type { Connection, Stop } from './types'

type MapLibre = typeof import('maplibre-gl')

// Our own map styles (public/map): OpenFreeMap's Positron recoloured in the Sage theme, a light and a dark one (the dark
// one on pure black). The tiles come from OpenFreeMap (free, no key). Edit the files in Maputnik. The style follows
// the light / dark theme.
const STYLE_LIGHT = `${import.meta.env.BASE_URL}map/ubian-light.json`
const STYLE_DARK = `${import.meta.env.BASE_URL}map/ubian-dark.json`
const styleUrl = (dark: boolean) => new URL(dark ? STYLE_DARK : STYLE_LIGHT, window.location.origin).href

const SLOVAKIA: [number, number] = [19.5, 48.7]
const SLOVAKIA_ZOOM = 6.3

// MapLibre cannot read the theme's oklch colours, so the route uses plain hex: the sage --primary of each mode.
const ROUTE = {
  light: { main: '#516b52', dimmed: '#b5c4b6' },
  dark: { main: '#9cc49c', dimmed: '#3a4c3b' },
}

const EMPTY: Parameters<GeoJSONSource['setData']>[0] = { type: 'FeatureCollection', features: [] }

/** (Re)creates the route source and layers. Needed after every style change, which removes them. */
function addRoute(instance: MapLibreMap, dark: boolean) {
  const { main, dimmed } = dark ? ROUTE.dark : ROUTE.light
  const color = ['case', ['get', 'dim'], dimmed, main] as never
  const layout = { 'line-cap': 'round', 'line-join': 'round' } as const
  instance.addSource('route', { type: 'geojson', data: EMPTY })
  instance.addLayer({
    id: 'route-transit',
    type: 'line',
    source: 'route',
    filter: ['!', ['get', 'walk']],
    layout,
    paint: { 'line-color': color, 'line-width': 5 },
  })
  instance.addLayer({
    id: 'route-walk',
    type: 'line',
    source: 'route',
    filter: ['get', 'walk'],
    layout,
    paint: { 'line-color': color, 'line-width': 3, 'line-dasharray': [1, 2] },
  })
}

/** Map that shows the selected connection. `activeLeg` highlights one leg and labels its stops with times. */
export function MapPreview({
  connection,
  activeLeg = null,
  insetBottom = 0,
  className,
}: {
  connection?: Connection
  activeLeg?: number | null
  /** Pixels at the bottom covered by the phone sheet, so the route is fitted above it. */
  insetBottom?: number
  className?: string
}) {
  const { t } = useI18n()
  const container = useRef<HTMLDivElement>(null)
  const library = useRef<MapLibre | null>(null)
  const map = useRef<MapLibreMap | null>(null)
  const markers = useRef<Marker[]>([])
  const dark = useDark()
  const darkNow = useRef(dark)
  useEffect(() => {
    darkNow.current = dark
  }, [dark])
  const appliedStyle = useRef('')
  const [ready, setReady] = useState(false)
  // Counts style loads, so the route is drawn again after a theme change.
  const [styleVersion, setStyleVersion] = useState(0)

  // Create the map once. The library loads on demand, so other pages do not download it.
  useEffect(() => {
    let cancelled = false
    import('maplibre-gl')
      .then((lib) => {
        if (cancelled || !container.current) return
        let instance: MapLibreMap
        appliedStyle.current = styleUrl(darkNow.current)
        try {
          instance = new lib.Map({
            container: container.current,
            style: appliedStyle.current,
            center: SLOVAKIA,
            zoom: SLOVAKIA_ZOOM,
            attributionControl: { compact: true },
            // North stays up and the view stays flat: no rotating, no tilting (mouse, touch or keyboard).
            dragRotate: false,
            pitchWithRotate: false,
            touchPitch: false,
            maxPitch: 0,
          })
        } catch {
          return // no WebGL (old device, tests): the page works without the map
        }
        instance.touchZoomRotate.disableRotation()
        instance.keyboard.disableRotation()
        library.current = lib
        map.current = instance
        // Phones pinch to zoom, so the +/- buttons are only for mouse users.
        if (!window.matchMedia('(pointer: coarse)').matches) {
          instance.addControl(new lib.NavigationControl({ showCompass: false }), 'bottom-right')
        }
        instance.on('style.load', () => {
          addRoute(instance, darkNow.current)
          setReady(true)
          setStyleVersion((v) => v + 1)
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      markers.current.forEach((m) => m.remove())
      markers.current = []
      map.current?.remove()
      map.current = null
      library.current = null
      setReady(false)
    }
  }, [])

  // Switch the map between the light and the dark style when the theme changes.
  useEffect(() => {
    const instance = map.current
    if (!ready || !instance) return
    const next = styleUrl(dark)
    if (next === appliedStyle.current) return
    appliedStyle.current = next
    instance.setStyle(next, { diff: false })
  }, [dark, ready])

  // Zoom to the connection when it changes (not on every hover over a leg).
  useEffect(() => {
    const instance = map.current
    const lib = library.current
    if (!ready || !instance || !lib) return
    if (!connection) {
      instance.easeTo({ center: SLOVAKIA, zoom: SLOVAKIA_ZOOM, duration: 600 })
      return
    }
    const bounds = new lib.LngLatBounds()
    connection.legs.forEach((leg) => leg.stops.forEach((s) => bounds.extend([s.lng, s.lat])))
    // Leave room for the search panel that floats over the left side of the map.
    const phone = window.innerWidth < 640
    const left = phone ? 50 : 12 + 330 + 40
    instance.fitBounds(bounds, {
      padding: { top: 70, bottom: phone ? insetBottom + 30 : 70, right: phone ? 50 : 70, left },
      maxZoom: 14,
      duration: 600,
    })
  }, [ready, connection, insetBottom])

  // Draw the route and the labels.
  useEffect(() => {
    const instance = map.current
    const lib = library.current
    if (!ready || !instance || !lib) return

    const source = instance.getSource('route') as GeoJSONSource | undefined
    source?.setData({
      type: 'FeatureCollection',
      features: (connection?.legs ?? []).map((leg, i) => ({
        type: 'Feature',
        properties: { walk: leg.kind === 'walk', dim: activeLeg !== null && activeLeg !== i },
        geometry: { type: 'LineString', coordinates: leg.stops.map((s) => [s.lng, s.lat]) },
      })),
    })

    markers.current.forEach((m) => m.remove())
    markers.current = labels(connection, activeLeg, { start: t('tt.map.start'), end: t('tt.map.end') }).map(
      ({ stop, text, strong, dot }) =>
        new lib.Marker({ element: labelElement(text, strong, dot) })
          .setLngLat([stop.lng, stop.lat])
          .addTo(instance),
    )
  }, [ready, styleVersion, connection, activeLeg, t])

  return (
    <div
      role="img"
      aria-label={t('tt.map.label')}
      className={cn('bg-muted relative overflow-hidden', className)}
    >
      <div ref={container} className="size-full" />
    </div>
  )
}

type Label = { stop: Stop; text: string; strong?: boolean; dot?: boolean }

/** What to write on the map: start, transfers and destination, or every stop (with its time) of one leg. */
function labels(
  connection: Connection | undefined,
  activeLeg: number | null,
  words: { start: string; end: string },
): Label[] {
  if (!connection) return []
  const leg = activeLeg === null ? undefined : connection.legs[activeLeg]
  if (leg) {
    return leg.stops.map((stop, i) => ({
      stop,
      text: stop.time,
      dot: true,
      strong: i === 0 || i === leg.stops.length - 1,
    }))
  }
  const first = connection.legs[0]
  const last = connection.legs[connection.legs.length - 1]
  return [
    { stop: firstStop(first), text: `${words.start} ${departure(connection)}`, strong: true },
    ...connection.legs.slice(1).map((l) => ({ stop: firstStop(l), text: firstStop(l).time, dot: true })),
    { stop: lastStop(last), text: `${words.end} ${arrival(connection)}`, strong: true },
  ]
}

/** MapLibre markers are plain DOM elements. Styled like the shadcn Badge. */
function labelElement(text: string, strong?: boolean, dot?: boolean): HTMLElement {
  // The marker is centred on the stop, so the element is only the dot; the badge hangs off its right side.
  const root = document.createElement('div')
  root.className = 'relative size-2.5'
  const point = document.createElement('span')
  point.className = cn(
    'bg-background border-primary absolute inset-0 rounded-full border-2',
    !dot && 'bg-primary',
  )
  root.append(point)
  const badge = document.createElement('span')
  badge.className = cn(
    'absolute top-1/2 left-full ml-1 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-xs',
    strong ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border',
  )
  badge.textContent = text
  root.append(badge)
  return root
}

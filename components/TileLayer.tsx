import '@maplibre/maplibre-gl-leaflet'
import L from 'leaflet'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

function getMapStyle(style: unknown) {
  if (process.env.NEXT_PUBLIC_STADIA_TILE_PROXY !== '1') return style
  if (!style || typeof style !== 'object') return style

  const sources = (style as { sources?: Record<string, unknown> }).sources
  if (!sources || typeof sources !== 'object') return style

  for (const source of Object.values(sources)) {
    if (!source || typeof source !== 'object') continue

    const tiles = (source as { tiles?: unknown }).tiles
    if (!Array.isArray(tiles)) continue

    ;(source as { tiles: string[] }).tiles = tiles.map((tile) =>
      typeof tile === 'string' &&
      tile.startsWith('https://tiles.stadiamaps.com/tiles/')
        ? tile.replace(
            'https://tiles.stadiamaps.com/tiles/',
            '/api/stadia-tiles/',
          )
        : (tile as string),
    )
  }

  return style
}

async function waitForMaplibreMap(layer: L.MaplibreGL, signal: AbortSignal) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (signal.aborted) return null
    const maplibreMap = layer.getMaplibreMap()
    if (maplibreMap) return maplibreMap
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return null
}

export default function TileLayer() {
  const map = useMap()
  const { resolvedTheme } = useTheme()
  const glRef = useRef<L.MaplibreGL | null>(null)

  useEffect(() => {
    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com">Leaflet</a>',
    )
  }, [map])

  useEffect(() => {
    if (!resolvedTheme) return

    const controller = new AbortController()
    const styleUrl = `/map-styles/${resolvedTheme}.json`

    const applyStyle = async () => {
      try {
        const response = await fetch(styleUrl, { signal: controller.signal })
        if (!response.ok) return

        const style = getMapStyle(await response.json())
        if (controller.signal.aborted) return

        if (glRef.current) {
          glRef.current.removeFrom(map)
          glRef.current = null
        }

        glRef.current = L.maplibreGL({
          style: style as never,
        })
        glRef.current.addTo(map)

        await waitForMaplibreMap(
          glRef.current as L.MaplibreGL,
          controller.signal,
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        throw error
      }
    }

    applyStyle()

    return () => controller.abort()
  }, [resolvedTheme, map])

  return null
}

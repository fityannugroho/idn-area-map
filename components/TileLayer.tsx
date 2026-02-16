import '@maplibre/maplibre-gl-leaflet'
import L from 'leaflet'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

export default function TileLayer() {
  const map = useMap()
  const { resolvedTheme } = useTheme()
  const glRef = useRef<L.MaplibreGL | null>(null)

  // Lazy initialization to avoid creating MaplibreGL instance on every render
  if (!glRef.current) {
    glRef.current = L.maplibreGL({
      style: `/map-styles/${resolvedTheme}.json`,
    })
  }

  useEffect(() => {
    if (!glRef.current) return

    const maplibreMap = glRef.current.getMaplibreMap()

    if (!maplibreMap) {
      glRef.current.addTo(map)

      map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com">Leaflet</a>',
      )

      return
    }

    // Update the style when the theme changes
    maplibreMap.setStyle(`/map-styles/${resolvedTheme}.json`)
  }, [map, resolvedTheme])

  return null
}

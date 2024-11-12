import '@maplibre/maplibre-gl-leaflet'
import L from 'leaflet'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

export default function TileLayer() {
  const map = useMap()
  const { resolvedTheme } = useTheme()
  const glRef = useRef<L.MaplibreGL>(
    L.maplibreGL({
      style: `/map-styles/${resolvedTheme}.json`,
    }),
  )

  useEffect(() => {
    const maplibreMap = glRef.current.getMaplibreMap()

    if (!maplibreMap) {
      glRef.current.addTo(map)
      return
    }

    // Update the style when the theme changes
    maplibreMap.setStyle(`/map-styles/${resolvedTheme}.json`)
  }, [map, resolvedTheme])

  return null
}

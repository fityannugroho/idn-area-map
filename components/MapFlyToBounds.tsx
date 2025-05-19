import type { LatLngBounds } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export default function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()

  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, bounds])

  return null
}

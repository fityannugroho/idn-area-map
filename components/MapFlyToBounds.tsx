import type { LatLngBounds } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'

export default function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()

  // Create a stable key from bounds primitives to avoid unnecessary fly animations
  const boundsKey = useMemo(
    () =>
      `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`,
    [bounds],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: boundsKey captures bounds value changes
  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, boundsKey])

  return null
}

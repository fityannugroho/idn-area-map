'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { LatLngBounds, Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import BoundaryLayers from './BoundaryLayers'
import IslandMarkers from './IslandMarkers'
import { useMapDashboard } from './hooks/useDashboard'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <Skeleton className="h-full rounded-none" />,
  ssr: false,
})

function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()

  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, bounds])

  return null
}

function MapRefSetter({ ref }: { ref?: React.Ref<LeafletMap> }) {
  const map = useMap()

  useEffect(() => {
    if (map && ref && 'current' in ref) {
      ref.current = map // Set the ref to the map instance
    }
  }, [map, ref])

  return null
}

function MapView({ ref }: { ref?: React.Ref<LeafletMap> }) {
  const { areaBounds } = useMapDashboard()

  return (
    <Map className="h-full z-0">
      <MapRefSetter ref={ref} />

      {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

      <BoundaryLayers />

      <IslandMarkers />
    </Map>
  )
}

export default MapView

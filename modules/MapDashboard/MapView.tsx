'use client'

import type { Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import MapFlyToBounds from '@/components/MapFlyToBounds'
import { Skeleton } from '@/components/ui/skeleton'
import BoundaryLayers from './BoundaryLayers'
import { useMapDashboard } from './hooks/useDashboard'
import IslandMarkers from './IslandMarkers'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <Skeleton className="h-full rounded-none" />,
  ssr: false,
})

function MapView({ ref }: { ref?: React.Ref<LeafletMap> }) {
  const { areaBounds } = useMapDashboard()

  return (
    <Map ref={ref} className="h-full z-0">
      {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

      <BoundaryLayers />

      <IslandMarkers />
    </Map>
  )
}

export default MapView

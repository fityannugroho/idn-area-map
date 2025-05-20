'use client'

import MapFlyToBounds from '@/components/MapFlyToBounds'
import { Skeleton } from '@/components/ui/skeleton'
import type { Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import BoundaryLayers from './BoundaryLayers'
import IslandMarkers from './IslandMarkers'
import { useMapDashboard } from './hooks/useDashboard'

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

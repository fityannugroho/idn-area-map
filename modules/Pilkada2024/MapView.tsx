'use client'

import MapFlyToBounds from '@/components/MapFlyToBounds'
import { Skeleton } from '@/components/ui/skeleton'
import type { Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import { useMapDashboard } from '../MapDashboard/hooks/useDashboard'
import BoundaryLayers from './BoundaryLayers'
import { usePilkada } from './hooks/usePilkada'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <Skeleton className="h-full rounded-none" />,
  ssr: false,
})

function MapView({ ref }: { ref?: React.Ref<LeafletMap> }) {
  const { election } = usePilkada()
  const { selectedArea, areaBounds } = useMapDashboard()
  const electionArea =
    election === 'governor' ? selectedArea.province : selectedArea.regency

  return (
    <Map ref={ref} className="h-full z-0">
      {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

      {election && electionArea && (
        <BoundaryLayers election={election} code={electionArea.code} />
      )}
    </Map>
  )
}

export default MapView

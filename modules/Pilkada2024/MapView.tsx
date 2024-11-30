'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { LatLngBounds, Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import { forwardRef, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapDashboard } from '../MapDashboard/hooks/useDashboard'
import BoundaryLayers from './BoundaryLayers'
import { usePilkada } from './hooks/usePilkada'

const Map = dynamic(() => import('@/components/map'), {
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

const MapRefSetter = forwardRef<LeafletMap | null>((props, ref) => {
  const map = useMap()

  useEffect(() => {
    if (map && ref && 'current' in ref) {
      ref.current = map // Set the ref to the map instance
    }
  }, [map, ref])

  return null
})
MapRefSetter.displayName = 'MapRefSetter'

const MapView = forwardRef<LeafletMap>((props, ref) => {
  const { election } = usePilkada()
  const { selectedArea, areaBounds } = useMapDashboard()
  const electionArea =
    election === 'governor' ? selectedArea.province : selectedArea.regency

  return (
    <Map className="h-full z-0">
      <MapRefSetter ref={ref} />

      {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

      {election && electionArea && (
        <BoundaryLayers election={election} code={electionArea.code} />
      )}
    </Map>
  )
})
MapView.displayName = 'MapView'

export default MapView

'use client'

import { Area } from '@/lib/const'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMapDashboard } from './hooks/useDashboard'
import { useIslands } from './hooks/useIslands'

const MarkerClusterGroup = dynamic(
  () => import('@/components/map-marker-cluster-group'),
  { ssr: false },
)

const MapMarker = dynamic(() => import('@/components/map-marker'), {
  ssr: false,
})

export default function IslandMarkers() {
  const { selectedArea, loading } = useMapDashboard()
  const regencyCode = selectedArea.regency?.code
  const { data: islands = [] } = useIslands(regencyCode)

  return (
    <MarkerClusterGroup
      chunkedLoading
      chunkProgress={(progress, total) =>
        loading(Area.ISLAND, progress < total)
      }
    >
      {islands.map((island) => (
        <MapMarker
          key={island.code}
          position={[island.latitude, island.longitude]}
          title={island.name}
        >
          <div className="flex flex-col gap-2">
            <b className="font-bold block">{island.name}</b>

            <span className="text-xs text-gray-500 block">
              {island.coordinate}
            </span>

            <Link
              href={`https://www.google.com/maps/search/${island.coordinate}`}
              passHref
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs inline-flex items-center gap-1"
            >
              <ExternalLinkIcon />
              See on Google Maps
            </Link>

            {(island.isPopulated || island.isOutermostSmall) && (
              <div className="flex gap-1 mt-1">
                {island.isPopulated && (
                  <span className="bg-green-500 text-popover font-semibold rounded-full px-2 py-1">
                    Populated
                  </span>
                )}
                {island.isOutermostSmall && (
                  <span className="bg-red-500 text-popover font-semibold rounded-full px-2 py-1">
                    Outermost Small Island
                  </span>
                )}
              </div>
            )}
          </div>
        </MapMarker>
      ))}
    </MarkerClusterGroup>
  )
}

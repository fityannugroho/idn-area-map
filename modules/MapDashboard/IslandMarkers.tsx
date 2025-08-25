'use client'

import { MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { toast } from 'sonner'
import { Area } from '@/lib/const'
import { useMapDashboard } from './hooks/useDashboard'
import { useIslands } from './hooks/useIslands'

const MarkerClusterGroup = dynamic(
  () => import('@/components/MapMarkerClusterGroup'),
  { ssr: false },
)

const MapMarker = dynamic(() => import('@/components/MapMarker'), {
  ssr: false,
})

export default function IslandMarkers() {
  const { loading } = useMapDashboard()
  const { data: islands = [] } = useIslands()

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
          <div className="flex flex-col">
            <span className="font-bold block text-sm">{island.name}</span>
            <span className="text-sm">{island.code}</span>

            <button
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(island.coordinate)
                  toast.success('Coordinate copied to clipboard', {
                    duration: 3_000, // 3 seconds
                  })
                } catch (_error) {
                  toast.error('Failed to copy coordinate to clipboard', {
                    closeButton: true,
                  })
                }
              }}
              className="mt-1 flex flex-col items-start gap-0"
              title="Copy Coordinate"
            >
              <span className="text-xs text-gray-500 block">Coordinate :</span>
              <br />
              <span className="text-xs">{island.coordinate}</span>
            </button>

            {(island.isPopulated || island.isOutermostSmall) && (
              <div className="flex gap-1 mt-2">
                {island.isPopulated && (
                  <span className="bg-green-500 text-xs text-popover font-semibold rounded px-2 py-0.5">
                    Populated
                  </span>
                )}
                {island.isOutermostSmall && (
                  <span className="bg-red-500 text-xs text-popover font-semibold rounded px-2 py-0.5">
                    Outermost Small Island
                  </span>
                )}
              </div>
            )}

            <Link
              href={`https://www.google.com/maps/search/${island.coordinate}`}
              passHref
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs inline-flex items-center gap-2 mt-4"
            >
              <MapIcon className="size-4" />
              See on Google Maps
            </Link>
          </div>
        </MapMarker>
      ))}
    </MarkerClusterGroup>
  )
}

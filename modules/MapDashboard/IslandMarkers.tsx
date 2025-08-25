'use client'

import {
  ClipboardIcon,
  ExternalLinkIcon,
  MapIcon,
  MoreVerticalIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { config } from '@/lib/config'
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
          <div className="flex flex-col min-w-[200px] max-w-[280px]">
            <span className="font-bold block text-sm">{island.name}</span>
            <span className="text-sm">{island.code}</span>

            <div className="mt-1 flex flex-col items-start gap-0">
              <span className="text-xs text-gray-500 block">Coordinate :</span>
              <br />
              <span className="text-xs">{island.coordinate}</span>
            </div>

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

            <div className="flex justify-between gap-2 mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href={`${config.dataSource.area.url}/islands/${island.code}`}
                  target="_blank"
                >
                  <ExternalLinkIcon />
                  View API data
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVerticalIcon />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="start" avoidCollisions>
                  <DropdownMenuItem
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
                  >
                    <ClipboardIcon />
                    Copy coordinate
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://www.google.com/maps/search/${island.coordinate}`}
                      target="_blank"
                    >
                      <MapIcon />
                      See on Google Maps
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </MapMarker>
      ))}
    </MarkerClusterGroup>
  )
}

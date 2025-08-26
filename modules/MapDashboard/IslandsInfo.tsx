'use client'

import { EyeClosedIcon, EyeIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMapDashboard } from './hooks/useDashboard'
import { useIslandsFilter } from './IslandsFilterProvider'

export default function IslandsInfo() {
  const { selectedArea } = useMapDashboard()
  const { filter, setFilter, counts, isLoading } = useIslandsFilter()
  const { showMarkers, setShowMarkers } = useIslandsFilter()

  return (
    <div className="w-full p-2 border rounded flex justify-center items-center text-center">
      {selectedArea.province || selectedArea.regency ? (
        <div className="flex flex-col w-full justify-center items-center">
          {isLoading ? (
            <div className="flex gap-2 justify-center items-center">
              <LoaderCircleIcon className="animate-spin size-4" />
              <span className="text-sm">Loading islands...</span>
            </div>
          ) : (
            <>
              <Button
                variant={showMarkers ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => setShowMarkers(!showMarkers)}
                title={showMarkers ? 'Hide islands' : 'Show islands'}
              >
                {counts.total} island{counts.total === 1 ? '' : 's'} found
                {showMarkers ? <EyeIcon /> : <EyeClosedIcon />}
              </Button>

              <div className="flex flex-wrap gap-2 w-full justify-center items-center mt-2">
                <Button
                  variant={filter.populated ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter({ populated: !filter.populated })}
                >
                  Populated ({counts.populated})
                </Button>

                <Button
                  variant={filter.outermostSmall ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFilter({ outermostSmall: !filter.outermostSmall })
                  }
                >
                  Outermost-small ({counts.outermostSmall})
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <span className="text-sm text-gray-500">
          Select a province or regency to see islands
        </span>
      )}
    </div>
  )
}

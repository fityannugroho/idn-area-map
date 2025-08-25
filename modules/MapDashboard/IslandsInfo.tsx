'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { useMapDashboard } from './hooks/useDashboard'
import { useIslands } from './hooks/useIslands'

export default function IslandsInfo() {
  const { selectedArea } = useMapDashboard()
  const { isLoading, data: islands = [] } = useIslands()

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
              <span className="text-sm">{islands.length} islands found</span>
              <span className="text-sm text-gray-500">
                {islands.filter((island) => island.isPopulated).length}{' '}
                populated
              </span>
              <span className="text-sm text-gray-500">
                {islands.filter((island) => island.isOutermostSmall).length}{' '}
                outermost
              </span>
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

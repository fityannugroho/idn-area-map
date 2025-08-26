'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { useMapDashboard } from './hooks/useDashboard'
import { useIslands } from './hooks/useIslands'

export default function IslandsInfo() {
  const { selectedArea } = useMapDashboard()
  const { isLoading, data: islands = [] } = useIslands()

  const populatedIslands = islands.filter((i) => i.isPopulated)
  const outermostSmallIslands = islands.filter((i) => i.isOutermostSmall)

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
                {populatedIslands.length} populated island
                {populatedIslands.length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm text-gray-500">
                {outermostSmallIslands.length} outermost-small island
                {outermostSmallIslands.length !== 1 ? 's' : ''}
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

'use client'

import { featureConfig } from '@/lib/config'
import { getObjectKeys } from '@/lib/utils'
import { useCallback } from 'react'
import AreaBoundary from './AreaBoundary'
import { useMapDashboard } from './hooks/useDashboard'

export default function BoundaryLayers() {
  const { boundaryVisibility, loading, selectedArea, setAreaBounds } =
    useMapDashboard()

  return (
    <>
      {getObjectKeys(featureConfig).map((area) => {
        const selected = selectedArea[area]
        const onLoading = useCallback(
          (isLoading: boolean) => loading(area, isLoading),
          [area],
        )

        if (selected) {
          return (
            <AreaBoundary
              key={selected.code}
              area={area}
              code={selected.code}
              eventHandlers={{
                add: (e) => {
                  setAreaBounds(e.target.getBounds())
                },
              }}
              onLoading={onLoading}
              pathOptions={{
                ...(!boundaryVisibility[area] && {
                  color: 'transparent',
                  fillOpacity: 0,
                }),
              }}
            />
          )
        }
      })}
    </>
  )
}

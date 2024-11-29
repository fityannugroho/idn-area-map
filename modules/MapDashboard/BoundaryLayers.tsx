'use client'

import { featureConfig } from '@/lib/config'
import { getObjectKeys } from '@/lib/utils'
import AreaBoundary from './AreaBoundary'
import { useMapDashboard } from './hooks/useDashboard'

export default function BoundaryLayers() {
  const { boundaryVisibility, selectedArea, setAreaBounds } = useMapDashboard()

  return (
    <>
      {getObjectKeys(featureConfig).map((area) => {
        const selected = selectedArea[area]

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

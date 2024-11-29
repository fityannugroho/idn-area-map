'use client'

import { featureConfig } from '@/lib/config'
import { getObjectKeys } from '@/lib/utils'
import AreaBoundary from './AreaBoundary'
import { useMapDashboard } from './hooks/useDashboard'

export default function BoundaryLayers() {
  const { selectedArea } = useMapDashboard()

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
            />
          )
        }
      })}
    </>
  )
}

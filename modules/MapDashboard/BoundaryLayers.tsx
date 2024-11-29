'use client'

import { featureConfig } from '@/lib/config'
import { getObjectKeys } from '@/lib/utils'
import { useCallback, useState } from 'react'
import AreaBoundary from './AreaBoundary'
import PopupArea from './PopupArea'
import { useMapDashboard } from './hooks/useDashboard'

export default function BoundaryLayers() {
  const { boundaryVisibility, loading, selectedArea, setAreaBounds } =
    useMapDashboard()
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>()

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
                click: (e) => {
                  setLatLng(e.latlng)
                },
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
              render={(data) => (
                <PopupArea area={area} data={data} latLng={latLng} />
              )}
            />
          )
        }
      })}
    </>
  )
}

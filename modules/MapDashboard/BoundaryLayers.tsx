'use client'

import type { LatLngLiteral } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import AreaBoundary from '@/components/AreaBoundary'
import { featureConfig } from '@/lib/config'
import { getObjectKeys } from '@/lib/utils'
import { useMapDashboard } from './hooks/useDashboard'
import PopupArea from './PopupArea'

export default function BoundaryLayers() {
  const { boundaryVisibility, loading, selectedArea, setAreaBounds } =
    useMapDashboard()
  const [latLng, setLatLng] = useState<LatLngLiteral | undefined>()

  // Keep a ref to the latest `loading` callback so stable handlers can call it
  const loadingRef = useRef(loading)
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  // Store stable per-area handlers so their identity doesn't change across renders
  const handlersRef = useRef<Record<string, (isLoading: boolean) => void>>({})

  return (
    <>
      {getObjectKeys(featureConfig).map((area) => {
        const selected = selectedArea[area]
        if (!selected) return null

        // Ensure a stable handler exists per area
        if (!handlersRef.current[area]) {
          handlersRef.current[area] = (isLoading: boolean) =>
            loadingRef.current(area, isLoading)
        }
        const onLoading = handlersRef.current[area]

        return (
          <AreaBoundary
            key={selected.code}
            area={area}
            code={selected.code}
            eventHandlers={{
              click: (e) => setLatLng(e.latlng),
              add: (e) => setAreaBounds(e.target.getBounds()),
            }}
            onLoading={onLoading}
            pathOptions={{
              ...(!boundaryVisibility[area] && {
                color: 'transparent',
                fillOpacity: 0,
              }),
            }}
          >
            <PopupArea area={area} code={selected.code} latLng={latLng} />
          </AreaBoundary>
        )
      })}
    </>
  )
}

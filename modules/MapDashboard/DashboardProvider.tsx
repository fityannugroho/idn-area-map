'use client'

import type { LatLngBounds } from 'leaflet'
import { type PropsWithChildren, useCallback, useState } from 'react'
import {
  type DashboardContext,
  MapDashboardContext,
  type SelectedArea,
} from './hooks/useDashboard'

export default function MapDashboardProvider({
  children,
  defaultSelected,
}: PropsWithChildren<{ defaultSelected?: SelectedArea }>) {
  const [isLoading, setLoading] = useState<DashboardContext['isLoading']>({})
  const [boundaryVisibility, setBoundaryVisibility] = useState<
    DashboardContext['boundaryVisibility']
  >({
    province: true,
    regency: true,
    district: true,
    village: true,
  })
  const [areaBounds, setAreaBounds] = useState<LatLngBounds>()
  const [selectedArea, setSelected] = useState<SelectedArea>(
    defaultSelected ?? {},
  )

  const loading = useCallback<DashboardContext['loading']>(
    (area, isLoading) => {
      setLoading((current) => ({
        ...current,
        [area]: isLoading,
      }))
    },
    [],
  )

  const showBoundary = useCallback<DashboardContext['showBoundary']>(
    (area, show = true) => {
      setBoundaryVisibility((current) => ({
        ...current,
        [area]: show,
      }))
    },
    [],
  )

  const changeSelectedArea = useCallback<
    DashboardContext['changeSelectedArea']
  >((area, selected) => {
    setSelected((current) => ({
      ...current,
      [area]: selected,
    }))
  }, [])

  const clear = useCallback(() => {
    setSelected({})
  }, [])

  const value: DashboardContext = {
    selectedArea,
    changeSelectedArea,
    isLoading,
    loading,
    boundaryVisibility,
    showBoundary,
    areaBounds,
    setAreaBounds,
    clear,
  }

  return (
    <MapDashboardContext.Provider value={value}>
      {children}
    </MapDashboardContext.Provider>
  )
}

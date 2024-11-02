'use client'

import type { FeatureArea } from '@/lib/config'
import {
  Area,
  type District,
  type Province,
  type Regency,
  type Village,
} from '@/lib/const'
import type { LatLngBounds } from 'leaflet'
import { createContext, useCallback, useContext, useState } from 'react'

export type SelectedArea = {
  [Area.PROVINCE]?: Province
  [Area.REGENCY]?: Regency
  [Area.DISTRICT]?: District
  [Area.VILLAGE]?: Village
}

type Props = {
  // Area Selection
  selectedArea: SelectedArea
  changeSelectedArea: <A extends FeatureArea>(
    area: A,
    selected?: SelectedArea[A],
  ) => void

  // Loading States
  isLoading: { [A in Area]?: boolean }
  loading: <A extends Area>(area: A, isLoading: boolean) => void

  // Boundary Display
  boundaryVisibility: { [A in FeatureArea]?: boolean }
  /**
   * Show or hide the boundary of an area.
   * @param area The area to show or hide the boundary.
   * @param show Whether to show the boundary. Defaults to `true`.
   */
  showBoundary: (area: FeatureArea, show?: boolean) => void

  // Map Bounds
  areaBounds: LatLngBounds | undefined
  setAreaBounds: React.Dispatch<React.SetStateAction<LatLngBounds | undefined>>

  /**
   * Clear selected areas.
   */
  clear: () => void
}

const MapDashboardContext = createContext<Props | undefined>(undefined)

export function MapDashboardProvider({
  children,
  defaultSelected,
}: {
  children: React.ReactNode

  defaultSelected?: SelectedArea
}) {
  const [isLoading, setLoading] = useState<Props['isLoading']>({})
  const [boundaryVisibility, setBoundaryVisibility] = useState<
    Props['boundaryVisibility']
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

  const loading = useCallback<Props['loading']>((area, isLoading) => {
    setLoading((current) => ({
      ...current,
      [area]: isLoading,
    }))
  }, [])

  const showBoundary = useCallback<Props['showBoundary']>(
    (area, show = true) => {
      setBoundaryVisibility((current) => ({
        ...current,
        [area]: show,
      }))
    },
    [],
  )

  const changeSelectedArea = useCallback<Props['changeSelectedArea']>(
    (area, selected) => {
      setSelected((current) => ({
        ...current,
        [area]: selected,
      }))
    },
    [],
  )

  const clear = useCallback(() => {
    setSelected({})
  }, [])

  const value: Props = {
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

export function useMapDashboard() {
  const context = useContext(MapDashboardContext)
  if (!context) {
    throw new Error('useMapDashboard must be used within MapDashboardProvider')
  }
  return context
}

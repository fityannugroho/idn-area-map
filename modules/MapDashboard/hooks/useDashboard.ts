import type { FeatureArea } from '@/lib/config'
import {
  Area,
  type District,
  type Province,
  type Regency,
  type Village,
} from '@/lib/const'
import type { LatLngBounds } from 'leaflet'
import { createContext, use } from 'react'

export type SelectedArea = {
  [Area.PROVINCE]?: Province
  [Area.REGENCY]?: Regency
  [Area.DISTRICT]?: District
  [Area.VILLAGE]?: Village
}

export type DashboardContext = {
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

export const MapDashboardContext = createContext<DashboardContext | undefined>(
  undefined,
)

export function useMapDashboard() {
  const context = use(MapDashboardContext)
  if (!context) {
    throw new Error('useMapDashboard must be used within MapDashboardProvider')
  }
  return context
}

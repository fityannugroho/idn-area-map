import DashboardLayout from '@/components/DashboardLayout'
import MapDashboardProvider from './DashboardProvider'
import type { SelectedArea } from './hooks/useDashboard'
import IslandsFilterProvider from './IslandsFilterProvider'
import MapView from './MapView'
import Sidebar from './Sidebar'

type Props = { defaultSelected?: SelectedArea }

export default function MapDashboard({ defaultSelected }: Props) {
  return (
    <MapDashboardProvider defaultSelected={defaultSelected}>
      <IslandsFilterProvider>
        <DashboardLayout Sidebar={Sidebar} MapView={MapView} />
      </IslandsFilterProvider>
    </MapDashboardProvider>
  )
}

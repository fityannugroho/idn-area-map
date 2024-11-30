import DashboardLayout from '@/components/dashboard-layout'
import MapDashboardProvider from './DashboardProvider'
import MapView from './MapView'
import Sidebar from './Sidebar'
import type { SelectedArea } from './hooks/useDashboard'

type Props = { defaultSelected?: SelectedArea }

export default function MapDashboard({ defaultSelected }: Props) {
  return (
    <MapDashboardProvider defaultSelected={defaultSelected}>
      <DashboardLayout Sidebar={Sidebar} MapView={MapView} />
    </MapDashboardProvider>
  )
}

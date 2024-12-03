import DashboardLayout from '@/components/DashboardLayout'
import MapDashboardProvider from '@/modules/MapDashboard/DashboardProvider'
import MapView from '@/modules/Pilkada2024/MapView'
import PilkadaProvider from '@/modules/Pilkada2024/PilkadaProvider'
import Sidebar from '@/modules/Pilkada2024/Sidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pilkada 2024 Indonesia - Interactive Map and Data',
  description:
    'Explore detailed data and interactive maps of Pilkada 2024 in Indonesia. Stay updated with the latest election information and insights.',
  keywords:
    'Pilkada 2024, Pilkada serentak, Indonesia elections, interactive map, election data, Pilkada map, Indonesian politics',
}

export default function Pilkada2024() {
  return (
    <PilkadaProvider>
      <MapDashboardProvider>
        <DashboardLayout Sidebar={Sidebar} MapView={MapView} />
      </MapDashboardProvider>
    </PilkadaProvider>
  )
}

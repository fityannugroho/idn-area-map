
import { Navbar } from '@/components/navbar'
import MapDashboard from '../components/map-dashboard'

export default function Home() {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main>
        <MapDashboard />
      </main>
    </>
  )
}

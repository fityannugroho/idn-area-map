import Navbar from '@/components/Navbar'
import MapDashboard from './components/MapDashboard'

export default function Home() {
  return (
    <>
      <header>
        <Navbar position='sticky' maxWidth='xl' />
      </header>

      <main>
        <MapDashboard />
      </main>
    </>
  )
}

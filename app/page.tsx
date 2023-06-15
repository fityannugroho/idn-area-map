import Navbar from '@/components/Navbar'
import MapDashboard from './components/MapDashboard'
import { getIslands, getProvinces } from '@/utils/data'

export default async function Home() {
  const provincesData = getProvinces()

  const [provinces] = await Promise.all([provincesData])

  return (
    <>
      <header>
        <Navbar position='sticky' maxWidth='xl' />
      </header>

      <main>
        <MapDashboard provinces={provinces} />
      </main>
    </>
  )
}

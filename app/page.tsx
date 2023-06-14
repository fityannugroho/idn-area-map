import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

export default function Home() {
  const Map = dynamic(() => import('@/components/Map'), {
    loading: () => <p>Loading the map...</p>,
    ssr: false
  })

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Map />
      </main>
    </>
  )
}

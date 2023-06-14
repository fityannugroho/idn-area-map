import dynamic from 'next/dynamic'

export default function Home() {
  const Map = dynamic(() => import('@/components/Map'), {
    loading: () => <p>Loading the map...</p>,
    ssr: false
  })

  return (
    <main>
      <Map />
    </main>
  )
}

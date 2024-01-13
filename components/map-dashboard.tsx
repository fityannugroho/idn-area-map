'use client'

import {
  Island,
  Province,
  Regency,
  getIslands,
  getProvinces,
  getRegencies,
} from '@/utils/data'
import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Combobox } from './combobox'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { Skeleton } from './ui/skeleton'

const Map = dynamic(() => import('@/components/map'), {
  loading: () => <Skeleton className="h-full rounded-none" />,
  ssr: false,
})

const MarkerClusterGroup = dynamic(
  () => import('@/components/map-marker-cluster-group'),
  {
    ssr: false,
  },
)

const MapMarker = dynamic(() => import('@/components/map-marker'), {
  ssr: false,
})

export default function MapDashboard() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setProvince] = useState<Province | null>(null)
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [selectedRegency, setRegency] = useState<Regency | null>(null)
  const [islands, setIslands] = useState<Island[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [panelDirection, setPanelDirection] = useState<
    'horizontal' | 'vertical'
  >('horizontal')

  useEffect(() => {
    getProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      getRegencies(selectedProvince.code).then(setRegencies)
    } else {
      setRegencies([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedRegency) {
      setLoading(true)
      getIslands(selectedRegency.code)
        .then(setIslands)
        .finally(() => setLoading(false))
    } else {
      setIslands([])
    }
  }, [selectedRegency])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPanelDirection('vertical')
      } else {
        setPanelDirection('horizontal')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ResizablePanelGroup direction={panelDirection} className="min-h-screen">
      <ResizablePanel
        defaultSize={25}
        minSize={10}
        className="h-full p-4 flex flex-col items-center gap-4"
        style={{
          overflowY: 'auto',
        }}
      >
        <Combobox
          options={provinces}
          label="Select Province"
          placeholder="Search Province"
          onSelect={(province) => {
            setProvince(province)
          }}
          isOptionEqualToValue={(opt, val) => opt.code === val.code}
          getOptionLabel={(opt) => opt.name}
          width="240px"
          autoClose
          fullWidth
        />

        <Combobox
          options={regencies}
          label="Select Regency"
          placeholder="Search Regency"
          onSelect={(regency) => {
            setRegency(regency)
          }}
          isOptionEqualToValue={(opt, val) => opt.code === val.code}
          getOptionLabel={(opt) => opt.name}
          width="240px"
          autoClose
          fullWidth
        />

        {/* Islands info */}
        {loading ? (
          <span className="text-sm text-gray-500">Loading islands data...</span>
        ) : (
          <span className="text-sm font-semibold w-fit">
            {islands.length} islands found
          </span>
        )}
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={75}>
        <Map className="h-full z-0">
          {islands.length && (
            <MarkerClusterGroup
              chunkedLoading
              chunkProgress={(progress, total) => setLoading(progress < total)}
            >
              {islands.map((island) => (
                <MapMarker
                  key={island.code}
                  position={[island.latitude, island.longitude]}
                  title={island.name}
                >
                  <b className="font-semibold text-blue-700 mb-2 block">
                    {island.name}
                  </b>

                  <span className="text-xs text-gray-500 block">
                    {island.coordinate}
                  </span>

                  {island.isPopulated && (
                    <span className="bg-green-500 text-white font-semibold text-xs rounded-full px-2 py-1 mt-2 me-1 inline-block">
                      Populated
                    </span>
                  )}
                  {island.isOutermostSmall && (
                    <span className="bg-red-500 text-white font-semibold text-xs rounded-full px-2 py-1 mt-2 inline-block">
                      Outermost Small Island
                    </span>
                  )}
                </MapMarker>
              ))}
            </MarkerClusterGroup>
          )}
        </Map>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

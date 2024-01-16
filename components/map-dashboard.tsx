'use client'

import {
  Areas,
  District,
  Island,
  Province,
  Query,
  Regency,
  Village,
  getData,
} from '@/lib/data'
import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Combobox, ComboboxProps } from './combobox'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'

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

type Selected = {
  province?: Province
  regency?: Regency
  district?: District
  village?: Village
}

function ComboboxArea<T extends { code: string; name: string }>(
  props: Omit<
    ComboboxProps<T>,
    'autoClose' | 'fullWidth' | 'optionKey' | 'getOptionLabel'
  >,
) {
  return (
    <Combobox
      {...(props as ComboboxProps<T>)}
      optionKey="code"
      getOptionLabel={(opt) => opt.name}
      autoClose
      fullWidth
    />
  )
}

export default function MapDashboard() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [islands, setIslands] = useState<Island[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [selected, setSelected] = useState<Selected>()
  const [query, setQuery] = useState<{ [A in Areas]?: Query<A> }>()
  const [loadingIslands, setLoadingIslands] = useState<boolean>(false)
  const [panelDirection, setPanelDirection] = useState<
    'horizontal' | 'vertical'
  >('horizontal')

  // Province data
  useEffect(() => {
    getData('provinces', { sortBy: 'name', limit: 100 })
      .then((res) => {
        setProvinces(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // Regency data
  useEffect(() => {
    getData('regencies', { ...query?.regencies, sortBy: 'name' })
      .then((res) => {
        setRegencies(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [query?.regencies])

  // District data
  useEffect(() => {
    getData('districts', { ...query?.districts, sortBy: 'name' })
      .then((res) => {
        setDistricts(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [query?.districts])

  // Village data
  useEffect(() => {
    getData('villages', { ...query?.villages, sortBy: 'name' })
      .then((res) => {
        setVillages(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [query?.villages])

  // Island data
  useEffect(() => {
    async function fetchIslandsRecursively(page = 1, limit = 100) {
      setLoadingIslands(true)

      const res = await getData('islands', {
        ...query?.islands,
        page,
        limit,
      })

      setIslands((current) => [...current, ...res.data])

      if (res.meta.pagination.pages.next) {
        await fetchIslandsRecursively(page + 1)
        return
      }

      setLoadingIslands(false)
    }

    setIslands([])

    if (query?.islands?.parentCode) {
      fetchIslandsRecursively()
    }
  }, [query?.islands])

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
        <ComboboxArea
          options={provinces}
          label="Province"
          placeholder="Search Province"
          value={selected?.province}
          onSelect={(province) => {
            setSelected((current) => ({ ...current, province }))
            if (province.code === query?.regencies?.parentCode) return
            setQuery((current) => ({
              ...current,
              regencies: { parentCode: province.code },
            }))
          }}
        />

        <ComboboxArea
          options={regencies}
          label="Regency"
          placeholder="Search Regency"
          value={selected?.regency}
          onSelect={(regency) => {
            setSelected((current) => ({ ...current, regency }))
            if (regency.code === query?.districts?.parentCode) return
            setQuery((current) => ({
              ...current,
              islands: { parentCode: regency.code },
              districts: { parentCode: regency.code },
            }))
          }}
          inputProps={{
            onValueChange: (name) => {
              if (name.length < 3) return
              setQuery((current) => ({
                ...current,
                regencies: { ...current?.regencies, name },
              }))
            },
          }}
        />

        <ComboboxArea
          options={districts}
          label="District"
          placeholder="Search District"
          value={selected?.district}
          onSelect={(district) => {
            setSelected((current) => ({ ...current, district }))
            if (district.code === query?.villages?.parentCode) return
            setQuery((current) => ({
              ...current,
              villages: { parentCode: district.code },
            }))
          }}
          inputProps={{
            onValueChange: (name) => {
              if (name.length < 3) return
              setQuery((current) => ({
                ...current,
                districts: { ...current?.districts, name },
              }))
            },
          }}
        />

        <ComboboxArea
          options={villages}
          label="Village"
          placeholder="Search village"
          value={selected?.village}
          onSelect={(village) => {
            setSelected((current) => ({ ...current, village }))
          }}
          inputProps={{
            onValueChange: (name) => {
              if (name.length < 3) return
              setQuery((current) => ({
                ...current,
                villages: { ...current?.villages, name },
              }))
            },
          }}
        />

        <hr className="w-full " />

        {/* Islands info */}
        <div className="w-full p-2 border rounded flex gap-2 justify-center items-center">
          {query?.islands?.parentCode ? (
            <>
              {loadingIslands && (
                <ReloadIcon className="h-4 w-4 animate-spin" />
              )}
              <span className="text-sm w-fit">
                {islands.length} islands found
              </span>
            </>
          ) : (
            <span className="text-sm w-fit text-gray-500">
              Select a regency to see islands
            </span>
          )}
        </div>

        <hr className="w-full " />

        <Button
          variant="outline"
          className="mt-auto items-center gap-1"
          onClick={() => {
            setQuery(undefined)
            setSelected(undefined)
            setRegencies([])
            setDistricts([])
            setVillages([])
            setIslands([])
          }}
        >
          <Cross2Icon className="h-4 w-4" />
          Clear All Data
        </Button>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={75}>
        <Map className="h-full z-0">
          {islands.length && (
            <MarkerClusterGroup
              chunkedLoading
              chunkProgress={(progress, total) =>
                setLoadingIslands(progress < total)
              }
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

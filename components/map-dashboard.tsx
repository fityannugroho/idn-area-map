'use client'

import { config } from '@/lib/config'
import { Query, getData } from '@/lib/data'
import { Cross2Icon, ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { Skeleton } from './ui/skeleton'
import { cn, debounce, ucFirstStr } from '@/lib/utils'
import ComboboxArea from './combobox-area'
import GeoJsonArea from './geojson-area'
import {
  Province,
  Regency,
  District,
  Village,
  Island,
  Areas,
  singletonArea,
  parentArea,
} from '@/lib/const'
import { Switch } from './ui/switch'
import { LatLngBounds } from 'leaflet'
import { useMap } from 'react-leaflet'

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

type FeatureAreas = Exclude<Areas, 'islands'>

const featureConfig: {
  readonly [A in FeatureAreas]: { color?: string; order: number }
} = {
  provinces: { color: '#2563eb', order: 0 },
  regencies: { color: '#16a34a', order: 1 },
  districts: { color: '#facc15', order: 2 },
  villages: { color: '#ef4444', order: 3 },
} as const

type Selected = {
  province?: Province
  regency?: Regency
  district?: District
  village?: Village
}

const MAX_PAGE_SIZE = config.dataSource.pagination.maxPageSize

const provinceQuery: Query<'provinces'> = {
  limit: MAX_PAGE_SIZE,
}

function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()

  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, bounds])

  return null
}

type Props = {
  defaultSelected?: Selected
}

export default function MapDashboard({ defaultSelected }: Props) {
  const [islands, setIslands] = useState<Island[]>([])
  const [selected, setSelected] = useState<Selected | undefined>(
    defaultSelected,
  )
  const [query, setQuery] =
    useState<{ [A in Exclude<Areas, 'provinces'>]?: Query<A> }>()
  const [isLoading, setLoading] = useState<{
    [A in Areas]?: boolean
  }>()
  const [hideBoundary, setHideBoundary] = useState<{
    [A in FeatureAreas]?: boolean
  }>()
  const [areaBounds, setAreaBounds] = useState<LatLngBounds>()
  const [panelDirection, setPanelDirection] = useState<
    'horizontal' | 'vertical'
  >('horizontal')

  useEffect(() => {
    if (defaultSelected) {
      setQuery({
        regencies: {
          parentCode: defaultSelected.province?.code,
          limit: MAX_PAGE_SIZE,
        },
        districts: {
          parentCode: defaultSelected.regency?.code,
          limit: MAX_PAGE_SIZE,
        },
        villages: {
          parentCode: defaultSelected.district?.code,
          limit: MAX_PAGE_SIZE,
        },
        ...(defaultSelected.regency && {
          islands: {
            parentCode: defaultSelected.regency.code,
            limit: MAX_PAGE_SIZE,
          },
        }),
      })
    }
  }, [defaultSelected])

  // Island data
  useEffect(() => {
    async function fetchIslandsRecursively(page = 1, limit = MAX_PAGE_SIZE) {
      setLoading((current) => ({ ...current, islands: true }))

      const res = await getData('islands', {
        ...query?.islands,
        page,
        limit,
      })

      if ('data' in res) {
        setIslands((current) => [...current, ...res.data])

        if (res.meta.pagination.pages.next) {
          await fetchIslandsRecursively(page + 1)
          return
        }
      }

      setLoading((current) => ({ ...current, islands: false }))
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
    <ResizablePanelGroup
      direction={panelDirection}
      className="min-h-[calc(100vh-3.875rem)]"
    >
      <ResizablePanel
        defaultSize={25}
        minSize={10}
        className="h-full p-4 flex flex-col items-center gap-4"
        style={{
          overflowY: 'auto',
        }}
      >
        <ComboboxArea
          area="provinces"
          selected={selected?.province}
          query={provinceQuery}
          onSelect={(province) => {
            setSelected((current) => ({ ...current, province }))
            if (province.code === query?.regencies?.parentCode) return
            setQuery((current) => ({
              ...current,
              regencies: { parentCode: province.code, limit: MAX_PAGE_SIZE },
            }))
          }}
        />

        <ComboboxArea
          area="regencies"
          selected={selected?.regency}
          query={query?.regencies}
          onSelect={(regency) => {
            setSelected((current) => ({ ...current, regency }))
            if (regency.code === query?.districts?.parentCode) return
            setQuery((current) => ({
              ...current,
              islands: { parentCode: regency.code, limit: MAX_PAGE_SIZE },
              districts: { parentCode: regency.code, limit: MAX_PAGE_SIZE },
            }))
          }}
          inputProps={{
            onValueChange: debounce((name) => {
              if (!selected?.province) {
                setQuery((current) => ({
                  ...current,
                  regencies: { ...current?.regencies, name },
                }))
              }
            }, 500),
          }}
          disabled={isLoading?.provinces}
        />

        <ComboboxArea
          area="districts"
          selected={selected?.district}
          query={query?.districts}
          onSelect={(district) => {
            setSelected((current) => ({ ...current, district }))
            if (district.code === query?.villages?.parentCode) return
            setQuery((current) => ({
              ...current,
              villages: { parentCode: district.code, limit: MAX_PAGE_SIZE },
            }))
          }}
          inputProps={{
            onValueChange: debounce((name) => {
              if (!selected?.regency) {
                setQuery((current) => ({
                  ...current,
                  districts: { ...current?.districts, name },
                }))
              }
            }, 500),
          }}
          disabled={isLoading?.regencies}
        />

        <ComboboxArea
          area="villages"
          selected={selected?.village}
          query={query?.villages}
          onSelect={(village) => {
            setSelected((current) => ({ ...current, village }))
          }}
          inputProps={{
            onValueChange: debounce((name) => {
              if (!selected?.district) {
                setQuery((current) => ({
                  ...current,
                  villages: { ...current?.villages, name },
                }))
              }
            }, 500),
          }}
          disabled={isLoading?.districts}
        />

        {/* Islands info */}
        <div className="w-full p-2 border rounded flex gap-2 justify-center items-center">
          {query?.islands?.parentCode ? (
            <>
              {isLoading?.islands && (
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

        {/* Boundary settings */}
        <div className="w-full p-2 flex flex-col gap-2">
          <h3 className="font-semibold">Show Boundary</h3>
          {Object.entries(featureConfig).map(([area, config]) => (
            <div key={area} className="flex items-center space-x-2">
              <Switch
                id={`${area}Boundary`}
                disabled={
                  !selected?.[
                    singletonArea[area as FeatureAreas] as keyof Selected
                  ]
                }
                defaultChecked
                onCheckedChange={(checked) => {
                  setHideBoundary((current) => ({
                    ...current,
                    [area]: !checked,
                  }))
                }}
              />
              <label
                htmlFor={`${area}Boundary`}
                className={cn(
                  'flex items-center gap-2',
                  !selected?.[
                    singletonArea[area as FeatureAreas] as keyof Selected
                  ] && 'text-gray-400',
                )}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: config.color,
                  }}
                />

                {ucFirstStr(singletonArea[area as FeatureAreas])}

                {isLoading?.[area as FeatureAreas] && (
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                )}
              </label>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="mt-auto items-center gap-1"
          onClick={() => {
            setQuery(undefined)
            setSelected(undefined)
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
          {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

          {Object.entries(featureConfig).map(([area, config]) => {
            const selectedArea =
              selected?.[singletonArea[area as FeatureAreas] as keyof Selected]

            if (!selectedArea) {
              return null
            }

            return (
              <GeoJsonArea
                key={selectedArea.code}
                area={area as FeatureAreas}
                code={selectedArea.code}
                pathOptions={{
                  color: config.color,
                  fillOpacity: 0.08,
                }}
                hide={hideBoundary?.[area as FeatureAreas]}
                eventHandlers={{
                  add: (e) => {
                    setAreaBounds(e.target.getBounds())
                  },
                }}
                onLoading={() => {
                  setLoading((current) => ({ ...current, [area]: true }))
                }}
                onLoaded={() => {
                  setLoading((current) => ({ ...current, [area]: false }))
                }}
                order={config.order}
              />
            )
          })}

          {islands.length && (
            <MarkerClusterGroup
              chunkedLoading
              chunkProgress={(progress, total) =>
                setLoading((current) => ({
                  ...current,
                  islands: progress < total,
                }))
              }
            >
              {islands.map((island) => (
                <MapMarker
                  key={island.code}
                  position={[island.latitude, island.longitude]}
                  title={island.name}
                >
                  <div className="flex flex-col gap-2">
                    <b className="font-bold block text-primary">
                      {island.name}
                    </b>

                    <span className="text-xs text-gray-500 block">
                      {island.coordinate}
                    </span>

                    <Link
                      href={`https://www.google.com/maps/search/${island.coordinate}`}
                      passHref
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs inline-flex items-center gap-1"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                      See on Google Maps
                    </Link>

                    {(island.isPopulated || island.isOutermostSmall) && (
                      <div className="flex gap-1 mt-1">
                        {island.isPopulated && (
                          <span className="bg-green-500 text-white font-medium rounded-full px-2 py-1">
                            Populated
                          </span>
                        )}
                        {island.isOutermostSmall && (
                          <span className="bg-red-500 text-white font-medium rounded-full px-2 py-1">
                            Outermost Small Island
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </MapMarker>
              ))}
            </MarkerClusterGroup>
          )}
        </Map>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

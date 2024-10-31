'use client'

import useDoubleTap from '@/hooks/useDoubleTap'
import { type FeatureArea, config, featureConfig } from '@/lib/config'
import {
  Area,
  type District,
  type Island,
  type Province,
  type Regency,
  type Village,
} from '@/lib/const'
import { type Query, getData } from '@/lib/data'
import { cn, debounce, ucFirstStr } from '@/lib/utils'
import { Cross2Icon, ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons'
import type { LatLngBounds, Map as LeafletMap } from 'leaflet'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import ComboboxArea from './combobox-area'
import GeoJsonArea from './geojson-area'
import { Button } from './ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import { Skeleton } from './ui/skeleton'
import { Switch } from './ui/switch'

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

const MAX_PAGE_SIZE = config.dataSource.area.pagination.maxPageSize

const provinceQuery: Query<Area.PROVINCE> = {
  limit: MAX_PAGE_SIZE,
}

function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()

  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, bounds])

  return null
}

const MapRefSetter = forwardRef<LeafletMap | null>((props, ref) => {
  const map = useMap()

  useEffect(() => {
    if (map && ref && 'current' in ref) {
      ref.current = map // Set the ref to the map instance
    }
  }, [map, ref])

  return null
})
MapRefSetter.displayName = 'MapRefSetter'

type Props = {
  defaultSelected?: Selected
}

export default function MapDashboard({ defaultSelected }: Props) {
  const [islands, setIslands] = useState<Island[]>([])
  const [selected, setSelected] = useState<Selected | undefined>(
    defaultSelected,
  )
  const [query, setQuery] =
    useState<{ [A in Exclude<Area, 'province'>]?: Query<A> }>()
  const [isLoading, setLoading] = useState<{ [A in Area]?: boolean }>()
  const [hideBoundary, setHideBoundary] =
    useState<{ [A in FeatureArea]?: boolean }>()
  const [areaBounds, setAreaBounds] = useState<LatLngBounds>()
  const [panelDirection, setPanelDirection] = useState<
    'horizontal' | 'vertical'
  >('horizontal')
  const mapRef = useRef<LeafletMap>(null)
  const sidebarRef = useRef<ImperativePanelHandle>(null)

  useEffect(() => {
    if (defaultSelected) {
      setQuery({
        [Area.REGENCY]: {
          parentCode: defaultSelected.province?.code,
          limit: MAX_PAGE_SIZE,
        },
        [Area.DISTRICT]: {
          parentCode: defaultSelected.regency?.code,
          limit: MAX_PAGE_SIZE,
        },
        [Area.VILLAGE]: {
          parentCode: defaultSelected.district?.code,
          limit: MAX_PAGE_SIZE,
        },
        ...(defaultSelected.regency && {
          [Area.ISLAND]: {
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

      const res = await getData(Area.ISLAND, {
        ...query?.island,
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

    if (query?.island?.parentCode) {
      fetchIslandsRecursively()
    }
  }, [query?.island])

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

  const handleResizeMap = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }

  const handleSidebarToggle = () => {
    const sidebar = sidebarRef.current
    if (sidebar?.isCollapsed()) {
      sidebar?.expand()
    } else {
      sidebar?.collapse()
    }
  }

  return (
    <ResizablePanelGroup
      direction={panelDirection}
      className="min-h-[calc(100vh-3.875rem)]"
    >
      <ResizablePanel
        defaultSize={25}
        minSize={16}
        collapsible
        className="h-full"
        ref={sidebarRef}
        style={{
          overflowY: 'auto',
        }}
      >
        <div className="p-4 flex flex-col items-center gap-4">
          <ComboboxArea
            area={Area.PROVINCE}
            selected={selected?.province}
            query={provinceQuery}
            onSelect={(province) => {
              setSelected((current) => ({ ...current, province }))
              if (province.code === query?.regency?.parentCode) return
              setQuery((current) => ({
                ...current,
                regency: { parentCode: province.code, limit: MAX_PAGE_SIZE },
              }))
            }}
          />

          <ComboboxArea
            area={Area.REGENCY}
            selected={selected?.regency}
            query={query?.regency}
            onSelect={(regency) => {
              setSelected((current) => ({ ...current, regency }))
              if (regency.code === query?.district?.parentCode) return
              setQuery((current) => ({
                ...current,
                island: { parentCode: regency.code, limit: MAX_PAGE_SIZE },
                district: { parentCode: regency.code, limit: MAX_PAGE_SIZE },
              }))
            }}
            inputProps={{
              onValueChange: debounce((name) => {
                if (!selected?.province) {
                  setQuery((current) => ({
                    ...current,
                    regency: { ...current?.regency, name },
                  }))
                }
              }, 500),
            }}
            disabled={isLoading?.province}
          />

          <ComboboxArea
            area={Area.DISTRICT}
            selected={selected?.district}
            query={query?.district}
            onSelect={(district) => {
              setSelected((current) => ({ ...current, district }))
              if (district.code === query?.village?.parentCode) return
              setQuery((current) => ({
                ...current,
                village: { parentCode: district.code, limit: MAX_PAGE_SIZE },
              }))
            }}
            inputProps={{
              onValueChange: debounce((name) => {
                if (!selected?.regency) {
                  setQuery((current) => ({
                    ...current,
                    district: { ...current?.district, name },
                  }))
                }
              }, 500),
            }}
            disabled={isLoading?.regency}
          />

          <ComboboxArea
            area={Area.VILLAGE}
            selected={selected?.village}
            query={query?.village}
            onSelect={(village) => {
              setSelected((current) => ({ ...current, village }))
            }}
            inputProps={{
              onValueChange: debounce((name) => {
                if (!selected?.district) {
                  setQuery((current) => ({
                    ...current,
                    village: { ...current?.village, name },
                  }))
                }
              }, 500),
            }}
            disabled={isLoading?.district}
          />

          {/* Islands info */}
          <div className="w-full p-2 border rounded flex gap-2 justify-center items-center">
            {query?.island?.parentCode ? (
              <>
                {isLoading?.island && (
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
              <div key={area} className="flex items-center space-x-2 truncate">
                <Switch
                  id={`${area}Boundary`}
                  disabled={!selected?.[area as keyof Selected]}
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
                    !selected?.[area as keyof Selected] && 'text-gray-400',
                  )}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: config.color,
                    }}
                  />

                  {ucFirstStr(area)}

                  {isLoading?.[area as FeatureArea] && (
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
        </div>
      </ResizablePanel>

      <ResizableHandle
        withHandle
        onDoubleClick={handleSidebarToggle}
        onTouchStart={useDoubleTap(handleSidebarToggle)}
      />

      <ResizablePanel
        defaultSize={75}
        onResize={debounce(handleResizeMap, 100)}
      >
        <Map className="h-full z-0">
          {areaBounds && <MapFlyToBounds bounds={areaBounds} />}

          <MapRefSetter ref={mapRef} />

          {Object.entries(featureConfig).map(([area, config]) => {
            const selectedArea = selected?.[area as keyof Selected]

            if (!selectedArea) {
              return null
            }

            return (
              <GeoJsonArea
                key={selectedArea.code}
                area={area as FeatureArea}
                code={selectedArea.code}
                pathOptions={{
                  color: config.color,
                  fillOpacity: 0.08,
                }}
                hide={hideBoundary?.[area as FeatureArea]}
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
                    <b className="font-bold block">{island.name}</b>

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
                          <span className="bg-green-500 text-popover font-semibold rounded-full px-2 py-1">
                            Populated
                          </span>
                        )}
                        {island.isOutermostSmall && (
                          <span className="bg-red-500 text-popover font-semibold rounded-full px-2 py-1">
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

'use client'

import { Areas as BaseAreas, singletonArea } from '@/lib/const'
import { GetSpecificDataReturn, getSpecificData } from '@/lib/data'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GeoJSONProps } from 'react-leaflet'
import { toast } from 'sonner'

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  {
    ssr: false,
  },
)

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

type Areas = Exclude<BaseAreas, 'islands'>

export type GeoJsonAreaProps<A extends Areas> = Omit<
  GeoJSONProps,
  'key' | 'data' | 'children'
> & {
  area: A
  code: string
  /**
   * Hide the area
   */
  hide?: boolean
  onLoading?: () => void
  onLoaded?: () => void
}

export default function GeoJsonArea<A extends Areas>({
  area,
  code,
  hide,
  eventHandlers,
  onLoading,
  onLoaded,
  pathOptions,
  ...props
}: GeoJsonAreaProps<A>) {
  const [geoJson, setGeoJson] =
    useState<GeoJSON.Feature<GeoJSON.MultiPolygon>>()
  const [areaData, setAreaData] = useState<GetSpecificDataReturn<A>['data']>()
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>()
  const parents = getAllParents(area)

  useEffect(() => {
    onLoading?.()

    fetch(`/api/${area}/${code}/boundary`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Data not found for ${singletonArea[area]} ${code}`)
          }
          throw new Error(`Unexpected status code: ${res.status}`)
        }
        return res.json()
      })
      .then((res) => {
        setGeoJson(res)
        onLoaded?.()
      })
      .catch((err) => {
        toast.error(`Failed to fetch ${singletonArea[area]} boundary data`, {
          description: err.message,
          closeButton: true,
        })
      })

    getSpecificData(area, code)
      .then((res) => {
        if ('data' in res) return setAreaData(res.data)
        throw new Error(
          Array.isArray(res.message) ? res.message[0] : res.message,
        )
      })
      .catch((err) => {
        toast.error(`Failed to fetch ${singletonArea[area]} data`, {
          description: err.message,
          closeButton: true,
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, code])

  return geoJson ? (
    <GeoJSON
      key={code}
      data={geoJson}
      eventHandlers={{
        ...eventHandlers,
        click: (e) => {
          setLatLng(e.latlng)
          eventHandlers?.click?.(e)
        },
      }}
      pathOptions={{
        ...pathOptions,
        ...(hide ? { fillOpacity: 0, color: 'transparent' } : {}),
      }}
      {...props}
    >
      <Popup>
        {areaData ? (
          <>
            <span className="block font-bold text-sm">{areaData.name}</span>
            <span className="text-sm">{addDotSeparator(areaData.code)}</span>

            {parents.map((parent) => {
              const parentData = areaData.parent[singletonArea[parent]]

              if (!parentData) return null

              return (
                <div key={parent} className="mt-1">
                  <span className="text-xs text-gray-500">
                    {ucFirstStr(singletonArea[parent])} :
                  </span>
                  <br />
                  <span className="text-xs">{parentData.name}</span>
                </div>
              )
            })}

            <Link
              href={`https://www.google.com/maps/search/${latLng?.lat},${latLng?.lng}`}
              passHref
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 mt-3"
              title={`Coordinate: ${latLng?.lat}, ${latLng?.lng}`}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              See on Google Maps
            </Link>
          </>
        ) : (
          <span className="block text-gray-500">Loading...</span>
        )}
      </Popup>
    </GeoJSON>
  ) : null
}

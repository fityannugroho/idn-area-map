'use client'

import { Areas as BaseAreas, singletonArea } from '@/lib/const'
import { GetSpecificDataReturn, getSpecificData } from '@/lib/data'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import dynamic from 'next/dynamic'
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
  'key' | 'data'
> & {
  area: A
  code?: string
  /**
   * Hide the area
   */
  hide?: boolean
}

export default function GeoJsonArea<A extends Areas>({
  area,
  code,
  hide,
  ...props
}: GeoJsonAreaProps<A>) {
  const [geoJson, setGeoJson] =
    useState<GeoJSON.Feature<GeoJSON.MultiPolygon>>()
  const [areaData, setAreaData] = useState<GetSpecificDataReturn<A>['data']>()
  const parents = getAllParents(area)

  useEffect(() => {
    setGeoJson(undefined)

    if (code) {
      fetch(`/api/${area}/${code}/boundary`)
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error(
                `Data not found for ${singletonArea[area]} ${code}`,
              )
            }
            throw new Error(`Unexpected status code: ${res.status}`)
          }
          return res.json()
        })
        .then((res) => setGeoJson(res))
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
    }
  }, [area, code])

  return geoJson && !hide ? (
    <GeoJSON key={code} data={geoJson} {...props}>
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
          </>
        ) : (
          <span className="block text-gray-500">Loading...</span>
        )}
      </Popup>
    </GeoJSON>
  ) : (
    <></>
  )
}

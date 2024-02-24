'use client'

import { Areas as BaseAreas, singletonArea } from '@/lib/const'
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
    }
  }, [area, code])

  return geoJson && !hide ? (
    <GeoJSON key={code} data={geoJson} {...props}>
      <Popup>
        <b className="mb-2">{geoJson.properties?.name}</b>
        <span className="block text-gray-500">
          Code: {geoJson.properties?.code}
        </span>
      </Popup>
    </GeoJSON>
  ) : (
    <></>
  )
}

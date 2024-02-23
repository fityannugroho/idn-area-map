'use client'

import { Areas as BaseAreas } from '@/lib/const'
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
}

export default function GeoJsonArea<A extends Areas>({
  area,
  code,
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
            throw new Error(
              `Failed to fetch boundary: ${res.status} ${res.statusText}`,
            )
          }
          return res.json()
        })
        .then((res) => setGeoJson(res))
        .catch((err) => {
          console.error(err)
        })
    }
  }, [area, code])

  return geoJson ? (
    <GeoJSON key={geoJson.properties?.code} data={geoJson} {...props}>
      <Popup>
        <div>
          <b className="mb-2">{geoJson.properties?.name}</b>
          <span className="block text-gray-500">
            Code: {geoJson.properties?.code}
          </span>
        </div>
      </Popup>
    </GeoJSON>
  ) : null
}

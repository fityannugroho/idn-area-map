'use client'

import { useArea } from '@/hooks/useArea'
import type { FeatureArea } from '@/lib/config'
import { getBoundaryData } from '@/lib/data'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import { ExternalLinkIcon, Link2Icon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import type { GeoJSONProps } from 'react-leaflet'
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

const Pane = dynamic(() => import('react-leaflet').then((mod) => mod.Pane), {
  ssr: false,
})

const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  {
    ssr: false,
  },
)

export type GeoJsonAreaProps<A extends FeatureArea> = Omit<
  GeoJSONProps,
  'key' | 'data' | 'children' | 'pane'
> & {
  area: A
  code: string
  /**
   * Hide the area
   */
  hide?: boolean
  /**
   * Called when the data is being fetched.
   */
  onLoading?: () => void
  /**
   * Called when the data is loaded successfully or not.
   * @param success Whether the data is loaded successfully or not.
   */
  onLoaded?: (success: boolean) => void
  /**
   * The pane order.
   */
  order?: number
}

/**
 * The default overlay pane for the GeoJsonArea component.
 *
 * @link https://leafletjs.com/reference.html#map-pane
 */
const defaultOverlayPaneZIndex = 400

export default function GeoJsonArea<A extends FeatureArea>({
  area,
  code,
  hide,
  eventHandlers,
  onLoading,
  onLoaded,
  order,
  pathOptions,
  ...props
}: GeoJsonAreaProps<A>) {
  const fetchBoundary = async () => {
    const res = await getBoundaryData(area, code)

    if (!res.data) {
      throw new Error(
        res.statusCode === 404
          ? `Data not found for ${area} ${code}`
          : `Unexpected status code: ${res.statusCode}`,
      )
    }

    return res.data
  }

  const {
    data: geoJson,
    status: geoStatus,
    error,
  } = useQuery({
    queryKey: ['geoJson', area, code],
    queryFn: fetchBoundary,
  })
  const { data: areaData, status: areaStatus } = useArea(area, code)
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>()
  const parents = getAllParents(area)

  if (areaStatus === 'error' || geoStatus === 'error') {
    toast.error(`Failed to fetch ${area} data`, {
      description: error?.message || 'An error occurred while fetching thedata',
      closeButton: true,
    })
    return null
  }

  return (
    <Pane
      name={area}
      style={{ zIndex: order ? defaultOverlayPaneZIndex + order : undefined }}
    >
      <FeatureGroup>
        {geoJson && (
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
          />
        )}

        {/* Render Popup inside the default `popupPane`.
            See https://leafletjs.com/reference.html#map-pane */}
        <Popup pane="popupPane">
          {areaStatus === 'pending' ? (
            <span className="block text-gray-500">Loading...</span>
          ) : (
            <>
              <span className="block font-bold text-sm">{areaData.name}</span>
              <span className="text-sm">{addDotSeparator(areaData.code)}</span>

              {parents.map((parent) => {
                const parentData = areaData.parent?.[parent]

                if (!parentData) return null

                return (
                  <div key={parent} className="mt-1">
                    <span className="text-xs text-gray-500">
                      {ucFirstStr(parent)} :
                    </span>
                    <br />
                    <span className="text-xs">{parentData.name}</span>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/${addDotSeparator(code)}`,
                    )
                    toast.success('Link copied to clipboard', {
                      duration: 3_000, // 3 seconds
                    })
                  } catch (error) {
                    toast.error('Failed to copy link to clipboard', {
                      closeButton: true,
                    })
                  }
                }}
                className="text-xs flex items-center gap-1 mt-3"
              >
                <Link2Icon className="h-4 w-4" />
                Copy Link
              </button>

              <Link
                href={`https://www.google.com/maps/search/${latLng?.lat},${latLng?.lng}`}
                passHref
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 mt-2"
                title={`Coordinate: ${latLng?.lat}, ${latLng?.lng}`}
              >
                <ExternalLinkIcon className="h-4 w-4" />
                See on Google Maps
              </Link>
            </>
          )}
        </Popup>
      </FeatureGroup>
    </Pane>
  )
}

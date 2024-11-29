'use client'

import { useArea } from '@/hooks/useArea'
import useBoundary from '@/hooks/useBoundary'
import { type FeatureArea, featureConfig } from '@/lib/config'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import { LinkIcon, MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { GeoJSONProps } from 'react-leaflet'
import { toast } from 'sonner'
import { useMapDashboard } from './hooks/useDashboard'

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

/**
 * The default overlay pane for the GeoJsonArea component.
 *
 * @link https://leafletjs.com/reference.html#map-pane
 */
const defaultOverlayPaneZIndex = 400

export type AreaBoundaryProps = Omit<
  GeoJSONProps,
  'key' | 'data' | 'children' | 'pane'
> & {
  area: FeatureArea
  code: string
}

export default function AreaBoundary({
  area,
  code,
  pathOptions,
  ...props
}: AreaBoundaryProps) {
  const { boundaryVisibility, loading, setAreaBounds } = useMapDashboard()
  const { order, color } = featureConfig[area]
  const { data: geoJson, status: geoStatus, error } = useBoundary(area, code)
  const { data: areaData, status: areaStatus } = useArea(area, code)
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>()

  if (areaStatus === 'error' || geoStatus === 'error') {
    toast.error(`Failed to fetch ${area} data`, {
      description: error?.message || 'An error occurred while fetching thedata',
      closeButton: true,
    })
    return null
  }

  useEffect(() => {
    loading(area, geoStatus === 'pending')
  }, [geoStatus, area, loading])

  return (
    <Pane
      name={area}
      style={{ zIndex: order ? defaultOverlayPaneZIndex + order : undefined }}
    >
      <FeatureGroup>
        {geoJson && (
          <GeoJSON
            {...props}
            key={code}
            data={geoJson}
            pathOptions={{
              ...pathOptions,
              color,
              fillOpacity: 0.08,
              ...(!boundaryVisibility[area] && {
                color: 'transparent',
                fillOpacity: 0,
              }),
            }}
            eventHandlers={{
              click: (e) => {
                setLatLng(e.latlng)
                props.eventHandlers?.click?.(e)
              },
              add: (e) => {
                setAreaBounds(e.target.getBounds())
              },
              ...props.eventHandlers,
            }}
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

              {getAllParents(area).map((parent) => {
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
                className="text-xs flex items-center gap-2 mt-4"
              >
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </button>

              <Link
                href={`https://www.google.com/maps/search/${latLng?.lat},${latLng?.lng}`}
                passHref
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-2 mt-2"
                title={`Coordinate: ${latLng?.lat}, ${latLng?.lng}`}
              >
                <MapIcon className="h-4 w-4" />
                See on Google Maps
              </Link>
            </>
          )}
        </Popup>
      </FeatureGroup>
    </Pane>
  )
}

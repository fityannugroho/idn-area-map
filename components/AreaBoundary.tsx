'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import type { GeoJSONProps } from 'react-leaflet'
import { toast } from 'sonner'
import useBoundary from '@/hooks/useBoundary'
import { type FeatureArea, featureConfig } from '@/lib/config'

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  {
    ssr: false,
  },
)

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

export type AreaBoundaryProps<A extends FeatureArea> = Omit<
  GeoJSONProps,
  'key' | 'data' | 'pane'
> & {
  area: A
  code: string
  onLoading?: (isLoading: boolean) => void
}

export default function AreaBoundary<A extends FeatureArea>({
  area,
  code,
  onLoading,
  pathOptions,
  ...props
}: AreaBoundaryProps<A>) {
  const { order, color } = featureConfig[area]
  const boundary = useBoundary(area, code)

  useEffect(() => {
    onLoading?.(boundary.status === 'pending')
  }, [boundary.status, onLoading])

  if (boundary.status === 'pending') {
    return null
  }

  if (boundary.status === 'error') {
    toast.error(`Failed to fetch ${area} boundary`, {
      description: boundary.error.message,
      closeButton: true,
    })
    return null
  }

  return (
    <Pane
      name={`boundary-${area}-${code}`}
      style={{ zIndex: order ? defaultOverlayPaneZIndex + order : undefined }}
    >
      <FeatureGroup>
        <GeoJSON
          {...props}
          key={code}
          data={boundary.data}
          pathOptions={{
            color,
            fillOpacity: 0.08,
            ...pathOptions,
          }}
        />
      </FeatureGroup>
    </Pane>
  )
}

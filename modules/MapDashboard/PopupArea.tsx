'use client'

import type { FeatureArea } from '@/lib/config'
import type { GetSpecificDataReturn } from '@/lib/data'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import { LinkIcon, MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import { toast } from 'sonner'

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

type PopupAreaProps<Area extends FeatureArea> = {
  area: Area
  data?: GetSpecificDataReturn<Area>['data']
  latLng?: { lat: number; lng: number }
}

function BasePopupArea({ children }: PropsWithChildren) {
  // Use `pane` property to render Popup inside the default `popupPane`.
  // See https://leafletjs.com/reference.html#map-pane
  return <Popup pane="popupPane">{children}</Popup>
}

export default function PopupArea<Area extends FeatureArea>({
  area,
  data,
  latLng,
}: PopupAreaProps<Area>) {
  if (!data) {
    return (
      <BasePopupArea>
        <span className="block text-gray-500">Loading...</span>
      </BasePopupArea>
    )
  }

  return (
    <BasePopupArea>
      <span className="block font-bold text-sm">{data.name}</span>
      <span className="text-sm">{addDotSeparator(data.code)}</span>

      {getAllParents(area).map((parent) => {
        const parentData = data.parent?.[parent]

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
              `${window.location.origin}/${addDotSeparator(data.code)}`,
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
    </BasePopupArea>
  )
}

'use client'

import { useArea } from '@/hooks/useArea'
import type { FeatureArea } from '@/lib/config'
import { addDotSeparator, getAllParents, ucFirstStr } from '@/lib/utils'
import { LinkIcon, MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { toast } from 'sonner'

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

type PopupAreaProps<Area extends FeatureArea> = {
  area: Area
  code: string
  latLng?: { lat: number; lng: number }
}

function BasePopupArea({
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Popup>, 'pane'>) {
  // Use `pane` property to render Popup inside the default `popupPane`.
  // See https://leafletjs.com/reference.html#map-pane
  return (
    <Popup {...props} pane="popupPane">
      {children}
    </Popup>
  )
}

export default function PopupArea<Area extends FeatureArea>({
  area,
  code,
  latLng,
}: PopupAreaProps<Area>) {
  const { data, status, error } = useArea(area, code)

  if (status === 'pending') {
    return (
      <BasePopupArea>
        <span className="block text-muted-foreground mx-auto">Loading...</span>
      </BasePopupArea>
    )
  }

  if (status === 'error') {
    toast.error('Failed to load area data', {
      description: error.message,
      closeButton: true,
    })
    return null
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
            <span className="text-xs text-muted-foreground">
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
        <LinkIcon className="size-4" />
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
        <MapIcon className="size-4" />
        See on Google Maps
      </Link>
    </BasePopupArea>
  )
}

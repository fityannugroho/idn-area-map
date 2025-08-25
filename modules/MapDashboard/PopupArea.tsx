'use client'
import {
  ExternalLinkIcon,
  LinkIcon,
  MapIcon,
  MoreVerticalIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useArea } from '@/hooks/useArea'
import { config, type FeatureArea } from '@/lib/config'
import { endpoints } from '@/lib/const'
import { getAllParents, ucFirstStr } from '@/lib/utils'

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
      <span className="text-sm">{data.code}</span>

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

      <div className="flex justify-between gap-2 mt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link
            href={`${config.dataSource.area.url}/${endpoints[area]}/${data.code}`}
            target="_blank"
          >
            <ExternalLinkIcon />
            View API data
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVerticalIcon />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="start" avoidCollisions>
            <DropdownMenuItem
              onClick={() => {
                try {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${data.code}`,
                  )
                  toast.success('Link copied to clipboard', {
                    duration: 3_000, // 3 seconds
                  })
                } catch (_error) {
                  toast.error('Failed to copy link to clipboard', {
                    closeButton: true,
                  })
                }
              }}
            >
              <LinkIcon />
              Copy link
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`https://www.google.com/maps/search/${latLng?.lat},${latLng?.lng}`}
                target="_blank"
              >
                <MapIcon />
                See on Google Maps
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BasePopupArea>
  )
}

'use client'

import 'leaflet/dist/leaflet.css'
import type { PropsWithChildren } from 'react'
import { MapContainer, type MapContainerProps, TileLayer } from 'react-leaflet'

export type MapProps = MapContainerProps & PropsWithChildren

export default function Map({
  center = [-3.028137, 119.764063],
  className = 'w-full h-full',
  zoom = 5,
  children,
  ...mapProps
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      {...mapProps}
    >
      <TileLayer
        attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="dark:hue-rotate-180 dark:invert dark:contrast-[.90] dark:brightness-90"
      />
      {children}
    </MapContainer>
  )
}

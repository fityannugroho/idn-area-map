'use client'

import 'leaflet/dist/leaflet.css'
import type { PropsWithChildren } from 'react'
import { MapContainer, type MapContainerProps } from 'react-leaflet'
import TileLayer from './tile-layer'

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
      {...mapProps}
      maxZoom={16} // Maximum zoom level provided by Protomaps
      center={center}
      zoom={zoom}
      className={className}
    >
      <TileLayer />
      {children}
    </MapContainer>
  )
}

'use client'

import {
  MapContainer, TileLayer, MapContainerProps,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export type MapProps = MapContainerProps

export default function Map({
  center = [-3.028137, 119.764063],
  className = 'w-full h-96',
  children,
  zoom = 5,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
    >
      <TileLayer
        attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}

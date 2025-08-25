'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer } from 'react-leaflet'
import TileLayer from './TileLayer'

export default function Map({
  center = [-3.028137, 119.764063],
  className = 'w-full h-full',
  zoom = 5,
  children,
  ...mapProps
}: React.ComponentPropsWithRef<typeof MapContainer>) {
  return (
    <MapContainer
      {...mapProps}
      maxZoom={24} // Maximum zoom level provided by the tile server
      center={center}
      zoom={zoom}
      className={className}
    >
      <TileLayer />
      {children}
    </MapContainer>
  )
}

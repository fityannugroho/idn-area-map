'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, MapContainerProps, TileLayer } from 'react-leaflet'
import MapMarker, { MapMarkerProps } from './Marker'
import MarkerClusterGroup from 'react-leaflet-cluster'

export type MapProps = MapContainerProps & {
  markers?: MapMarkerProps[]
}

export default function Map({
  center = [-3.028137, 119.764063],
  className = 'w-full h-96',
  markers = [],
  zoom = 5,
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
      />

      <MarkerClusterGroup
        chunkedLoading
      >
        {markers.map(({ children, key, ...marker }) => (
          <MapMarker key={key} {...marker}>
            {children}
          </MapMarker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

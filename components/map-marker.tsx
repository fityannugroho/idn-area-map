'use client'

import { icon } from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Marker, MarkerProps, Popup, PopupProps } from 'react-leaflet'

export type MapMarkerProps = MarkerProps & {
  PopupProps?: PopupProps
}

export default function MapMarker({
  children,
  PopupProps,
  ...markerProps
}: MapMarkerProps) {
  return (
    <Marker
      icon={icon({
        iconUrl: markerIcon.src,
        iconRetinaUrl: markerIcon2x.src,
        shadowUrl: markerShadow.src,
        iconSize: [24, 40],
        shadowSize: [0, 0],
        iconAnchor: [12, 40],
        popupAnchor: [0, -40],
      })}
      {...markerProps}
    >
      {children && <Popup {...PopupProps}>{children}</Popup>}
    </Marker>
  )
}

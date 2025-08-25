'use client'

import { icon } from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Marker, type MarkerProps, Popup, type PopupProps } from 'react-leaflet'

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
        // marker imports under Next can be either a string (turbopack) or an object with `src` (webpack).
        iconUrl: typeof markerIcon === 'string' ? markerIcon : markerIcon.src,
        iconRetinaUrl:
          typeof markerIcon2x === 'string' ? markerIcon2x : markerIcon2x.src,
        shadowUrl:
          typeof markerShadow === 'string' ? markerShadow : markerShadow.src,
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

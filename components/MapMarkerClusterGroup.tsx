'use client'

import { createPathComponent } from '@react-leaflet/core'
import Leaflet, { type LeafletEventHandlerFn } from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import type { PropsWithChildren } from 'react'

export type MarkerClusterGroupProps = PropsWithChildren &
  Leaflet.MarkerClusterGroupOptions

const MarkerClusterGroup = createPathComponent<
  Leaflet.MarkerClusterGroup,
  MarkerClusterGroupProps
>(({ children: _c, ...props }, ctx) => {
  const clusterProps: Record<string, unknown> = {}
  const clusterEvents: Record<string, LeafletEventHandlerFn> = {}

  // Splitting props and events to different objects
  for (const [propName, prop] of Object.entries(props)) {
    if (propName.startsWith('on')) {
      clusterEvents[propName] = prop as LeafletEventHandlerFn
    } else {
      clusterProps[propName] = prop
    }
  }

  // Creating markerClusterGroup Leaflet element
  const markerClusterGroup = Leaflet.markerClusterGroup(clusterProps)

  // Initializing event listeners
  for (const [eventAsProp, callback] of Object.entries(clusterEvents)) {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`
    markerClusterGroup.on(clusterEvent, callback)
  }

  return {
    instance: markerClusterGroup,
    context: { ...ctx, layerContainer: markerClusterGroup },
  }
})

export default MarkerClusterGroup

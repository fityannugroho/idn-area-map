'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import useDoubleTap from '@/hooks/useDoubleTap'
import { debounce } from '@/lib/utils'
import type { Map as LeafletMap } from 'leaflet'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import MapView from './MapView'
import Sidebar from './Sidebar'
import { MapDashboardProvider, type SelectedArea } from './hooks/useDashboard'

type Props = { defaultSelected?: SelectedArea }

type Orientation = 'horizontal' | 'vertical'

export default function MapDashboard({ defaultSelected }: Props) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useLayoutEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth < 768 ? 'vertical' : 'horizontal')
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleResizeMap = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }

  const handleSidebarToggle = () => {
    const sidebar = sidebarRef.current
    if (sidebar?.isCollapsed()) {
      sidebar?.expand()
    } else {
      sidebar?.collapse()
    }
  }

  return (
    <MapDashboardProvider defaultSelected={defaultSelected}>
      <ResizablePanelGroup
        direction={orientation}
        className="min-h-[calc(100vh-3.875rem)]"
      >
        <ResizablePanel
          defaultSize={25}
          minSize={16}
          collapsible
          className="h-full"
          ref={sidebarRef}
          style={{
            overflowY: 'auto',
          }}
        >
          <Sidebar />
        </ResizablePanel>

        <ResizableHandle
          withHandle
          onDoubleClick={handleSidebarToggle}
          onTouchStart={useDoubleTap(handleSidebarToggle)}
        />

        <ResizablePanel
          defaultSize={75}
          onResize={debounce(handleResizeMap, 100)}
        >
          <MapView ref={mapRef} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </MapDashboardProvider>
  )
}

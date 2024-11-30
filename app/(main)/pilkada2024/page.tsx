'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import useDoubleTap from '@/hooks/useDoubleTap'
import { debounce } from '@/lib/utils'
import { MapDashboardProvider } from '@/modules/MapDashboard/hooks/useDashboard'
import MapView from '@/modules/Pilkada2024/MapView'
import Sidebar from '@/modules/Pilkada2024/Sidebar'
import { PilkadaProvider } from '@/modules/Pilkada2024/hooks/usePilkada'
import type { Map as LeafletMap } from 'leaflet'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ImperativePanelHandle } from 'react-resizable-panels'

type Orientation = 'horizontal' | 'vertical'

export default function Pilkada2024() {
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
    <PilkadaProvider>
      <MapDashboardProvider>
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
    </PilkadaProvider>
  )
}

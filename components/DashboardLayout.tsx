'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import type { Map as LeafletMap } from 'leaflet'
import type { RefAttributes } from 'react'

export default function DashboardLayout({
  Sidebar,
  MapView,
}: {
  Sidebar: React.FC
  MapView: React.FC<RefAttributes<LeafletMap>>
}) {
  const {
    orientation,
    sidebarRef,
    mapRef,
    handleSidebarToggle,
    handleResizeMap,
  } = useDashboardLayout()

  return (
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
        style={{ overflowY: 'auto' }}
      >
        <Sidebar />
      </ResizablePanel>

      <ResizableHandle
        withHandle
        onDoubleClick={handleSidebarToggle}
        onTouchStart={handleSidebarToggle}
      />

      <ResizablePanel defaultSize={75} onResize={handleResizeMap}>
        <MapView ref={mapRef} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

import { debounce } from '@/lib/utils'
import type { Map as LeafletMap } from 'leaflet'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ImperativePanelHandle } from 'react-resizable-panels'

export function useDashboardLayout() {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  )
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

  const handleSidebarToggle = () => {
    const sidebar = sidebarRef.current
    if (sidebar?.isCollapsed()) {
      sidebar.expand()
    } else {
      sidebar?.collapse()
    }
  }

  const handleResizeMap = debounce(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }, 100)

  return {
    orientation,
    sidebarRef,
    mapRef,
    handleSidebarToggle,
    handleResizeMap,
  }
}

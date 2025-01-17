'use client'

import { Button } from '@/components/ui/button'
import { EraserIcon } from 'lucide-react'
import AreaSelectors from './AreaSelectors'
import BoundarySettings from './BoundarySettings'
import IslandsInfo from './IslandsInfo'
import { useMapDashboard } from './hooks/useDashboard'

export default function Sidebar() {
  const { clear } = useMapDashboard()

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <AreaSelectors />

      <IslandsInfo />

      <BoundarySettings />

      <Button
        variant="outline"
        className="mt-auto items-center"
        onClick={() => {
          clear()
        }}
      >
        <EraserIcon />
        Clear All Data
      </Button>
    </div>
  )
}

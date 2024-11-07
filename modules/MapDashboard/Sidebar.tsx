'use client'

import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
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
        className="mt-auto items-center gap-1"
        onClick={() => {
          clear()
        }}
      >
        <Cross2Icon />
        Clear All Data
      </Button>
    </div>
  )
}

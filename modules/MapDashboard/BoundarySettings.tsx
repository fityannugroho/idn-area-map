'use client'

import { Switch } from '@/components/ui/switch'
import { featureConfig } from '@/lib/config'
import { cn, objectToEntries, ucFirstStr } from '@/lib/utils'
import { LoaderCircleIcon } from 'lucide-react'
import { useMapDashboard } from './hooks/useDashboard'

export default function BoundarySettings() {
  const { showBoundary, isLoading } = useMapDashboard()

  return (
    <div className="w-full p-2 flex flex-col gap-2">
      <h3 className="font-semibold">Show Boundary</h3>

      {objectToEntries(featureConfig).map(([area, config]) => (
        <div key={area} className="flex items-center space-x-2 truncate">
          <Switch
            id={`${area}Boundary`}
            defaultChecked
            onCheckedChange={(checked) => {
              showBoundary(area, checked)
            }}
          />
          <label
            htmlFor={`${area}Boundary`}
            className={cn('flex items-center gap-2')}
          >
            <div
              className="size-4 rounded"
              style={{
                backgroundColor: config.color,
              }}
            />

            {ucFirstStr(area)}

            {isLoading[area] && (
              <LoaderCircleIcon className="size-4 animate-spin" />
            )}
          </label>
        </div>
      ))}
    </div>
  )
}

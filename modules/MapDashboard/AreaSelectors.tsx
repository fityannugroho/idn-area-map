'use client'

import { config, featureConfig } from '@/lib/config'
import { debounce, getAreaRelations, getObjectKeys } from '@/lib/utils'
import { useMemo } from 'react'
import ComboboxArea from './ComboboxArea'
import { type SelectedArea, useMapDashboard } from './hooks/useDashboard'

const MAX_PAGE_SIZE = config.dataSource.area.pagination.maxPageSize

export default function AreaSelectors() {
  const { isLoading, selectedArea, changeSelectedArea, updateQuery } =
    useMapDashboard()
  const areas = useMemo(
    () =>
      getObjectKeys(featureConfig).map((area) => ({
        area,
        ...getAreaRelations(area),
      })),
    [],
  )

  return (
    <div className="flex flex-col gap-2 w-full">
      {areas.map(({ area, parent, child }) => (
        <ComboboxArea
          key={area}
          area={area}
          disabled={parent ? isLoading[parent] : false}
          onSelect={(selected) => {
            changeSelectedArea(area, selected as SelectedArea)

            if (child) {
              updateQuery(child, {
                parentCode: selected.code,
                limit: MAX_PAGE_SIZE,
              })
            }
          }}
          inputProps={{
            onValueChange: debounce((name) => {
              if (parent && parent !== 'island' && !selectedArea[parent]) {
                updateQuery(area, { name })
              }
            }, 500),
          }}
        />
      ))}
    </div>
  )
}

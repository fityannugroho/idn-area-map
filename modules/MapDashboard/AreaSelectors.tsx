'use client'

import { type FeatureArea, config, featureConfig } from '@/lib/config'
import type { Query } from '@/lib/data'
import {
  debounce,
  getAreaRelations,
  getObjectKeys,
  objectFromEntries,
} from '@/lib/utils'
import { useMemo, useState } from 'react'
import ComboboxArea from './ComboboxArea'
import { useMapDashboard } from './hooks/useDashboard'

const MAX_PAGE_SIZE = config.dataSource.area.pagination.maxPageSize

export default function AreaSelectors() {
  const { isLoading, selectedArea, changeSelectedArea } = useMapDashboard()

  const areas = useMemo(
    () =>
      getObjectKeys(featureConfig).map((area) => ({
        area,
        ...getAreaRelations(area),
      })),
    [],
  )

  const defaultQuery = objectFromEntries(
    areas.reduce<[FeatureArea, Query<FeatureArea>][]>(
      (acc, { area, parent }) => {
        if (parent !== 'island') {
          acc.push([
            area,
            {
              ...(area === 'province' && {
                limit: MAX_PAGE_SIZE,
              }),
              ...(parent && {
                parentCode: selectedArea[parent]?.code,
              }),
            },
          ])
        }
        return acc
      },
      [],
    ),
  )

  const [query, setQuery] =
    useState<{ [A in FeatureArea]: Query<A> }>(defaultQuery)

  return (
    <div className="flex flex-col gap-2 w-full">
      {areas.map(({ area, parent, child }) => (
        <ComboboxArea
          key={area}
          area={area}
          query={query[area]}
          disabled={parent ? isLoading[parent] : false}
          onSelect={(selected) => {
            changeSelectedArea(area, selected)

            if (child) {
              setQuery((prevQuery) => ({
                ...prevQuery,
                [child]: {
                  parentCode: selected.code,
                  limit: MAX_PAGE_SIZE,
                },
              }))
            }
          }}
          inputProps={{
            onValueChange: debounce((name) => {
              if (parent && parent !== 'island' && !selectedArea[parent]) {
                setQuery((prevQuery) => ({
                  ...prevQuery,
                  [area]: { name },
                }))
              }
            }, 500),
          }}
        />
      ))}
    </div>
  )
}

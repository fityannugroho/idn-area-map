'use client'

import { useEffect, useMemo, useState } from 'react'
import ComboboxArea from '@/components/ComboboxArea'
import { config, type FeatureArea, featureConfig } from '@/lib/config'
import type { Query } from '@/lib/data'
import {
  debounce,
  getAreaRelations,
  getObjectKeys,
  objectFromEntries,
} from '@/lib/utils'
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
    areas.reduce<[FeatureArea, Query<FeatureArea> | undefined][]>(
      (acc, { area, parent }) => {
        let query: Query<FeatureArea> | undefined

        if (area === 'province') {
          query = { limit: MAX_PAGE_SIZE }
        }

        if (parent && parent !== 'island' && selectedArea[parent]) {
          query = {
            parentCode: selectedArea[parent]?.code,
            limit: MAX_PAGE_SIZE,
          }
        }

        acc.push([area, query])
        return acc
      },
      [],
    ),
  )

  const [query, setQuery] =
    useState<{ [A in FeatureArea]?: Query<A> }>(defaultQuery)

  // Reset query to default when selectedArea is cleared
  // biome-ignore lint/correctness/useExhaustiveDependencies: only depends to selectedArea
  useEffect(() => {
    for (const { area } of areas) {
      if (!selectedArea[area]) {
        setQuery((prevQuery) => ({
          ...prevQuery,
          [area]: defaultQuery[area],
        }))
      }
    }
  }, [selectedArea])

  return (
    <div className="flex flex-col gap-2 w-full">
      {areas.map(({ area, parent, child }) => (
        <ComboboxArea
          key={area}
          area={area}
          defaultSelected={selectedArea[area]}
          query={query[area]}
          disabled={parent ? isLoading[parent] : false}
          reset={!selectedArea[area]}
          autoClose
          fullWidth
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
                  [area]: name ? { name } : undefined,
                }))
              }
            }, 500),
          }}
        />
      ))}
    </div>
  )
}

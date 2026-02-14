'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { Island } from '@/lib/const'
import { useIslands } from './hooks/useIslands'

type FilterState = {
  populated: boolean
  outermostSmall: boolean
}

type ContextValue = {
  filter: FilterState
  setFilter: (f: Partial<FilterState>) => void
  filteredIslands: Island[]
  counts: {
    total: number
    shown: number
    populated: number
    outermostSmall: number
  }
  isLoading: boolean
  showMarkers: boolean
  setShowMarkers: (v: boolean) => void
}

const IslandsFilterContext = createContext<ContextValue | null>(null)

export function IslandsFilterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: islands = [], isLoading } = useIslands()
  const [filter, setFilterState] = useState<FilterState>({
    populated: false,
    outermostSmall: false,
  })
  const [showMarkers, setShowMarkers] = useState<boolean>(true)

  const setFilter = (f: Partial<FilterState>) => {
    setFilterState((s) => ({ ...s, ...f }))
  }

  const { counts, filteredIslands } = useMemo(() => {
    let populated = 0
    let outermostSmall = 0
    const filtered: Island[] = []

    const filterActive = filter.populated || filter.outermostSmall

    for (const island of islands) {
      if (island.isPopulated) populated++
      if (island.isOutermostSmall) outermostSmall++

      if (!filterActive) {
        filtered.push(island)
      } else if (
        (filter.populated && island.isPopulated) ||
        (filter.outermostSmall && island.isOutermostSmall)
      ) {
        filtered.push(island)
      }
    }

    return {
      counts: {
        total: islands.length,
        shown: filtered.length,
        populated,
        outermostSmall,
      },
      filteredIslands: filtered,
    }
  }, [islands, filter.populated, filter.outermostSmall])

  const value: ContextValue = {
    filter,
    setFilter,
    showMarkers,
    setShowMarkers,
    filteredIslands,
    counts,
    isLoading,
  }

  return (
    <IslandsFilterContext.Provider value={value}>
      {children}
    </IslandsFilterContext.Provider>
  )
}

export function useIslandsFilter() {
  const ctx = useContext(IslandsFilterContext)
  if (!ctx)
    throw new Error(
      'useIslandsFilter must be used within IslandsFilterProvider',
    )
  return ctx
}

export default IslandsFilterProvider

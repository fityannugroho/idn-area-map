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

  const counts = useMemo(() => {
    const total = islands.length
    const populated = islands.filter((i) => i.isPopulated).length
    const outermostSmall = islands.filter((i) => i.isOutermostSmall).length
    // compute shown using OR semantics when both toggles true
    const shown = islands.filter((i) => {
      if (!filter.populated && !filter.outermostSmall) return true
      return (
        (filter.populated && i.isPopulated) ||
        (filter.outermostSmall && i.isOutermostSmall)
      )
    }).length

    return { total, shown, populated, outermostSmall }
  }, [islands, filter])

  const filteredIslands = useMemo(() => {
    if (!filter.populated && !filter.outermostSmall) return islands
    return islands.filter(
      (i) =>
        (filter.populated && i.isPopulated) ||
        (filter.outermostSmall && i.isOutermostSmall),
    )
  }, [islands, filter])

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

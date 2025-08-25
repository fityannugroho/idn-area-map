import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { config } from '@/lib/config'
import { Area, type Island } from '@/lib/const'
import { getData } from '@/lib/data'
import { useMapDashboard } from './useDashboard'

const MAX_PAGE_SIZE = config.dataSource.area.pagination.maxPageSize

async function fetchIslandsRecursively(
  regencyCode: string,
  page = 1,
): Promise<Island[]> {
  const res = await getData(Area.ISLAND, {
    page,
    parentCode: regencyCode,
    limit: MAX_PAGE_SIZE,
  })

  if ('data' in res) {
    const islands = [...res.data]

    if (res.meta.pagination.pages.next) {
      const nextIslands = await fetchIslandsRecursively(regencyCode, page + 1)
      return [...islands, ...nextIslands]
    }

    return islands
  }

  return []
}

export function useIslands() {
  const { selectedArea } = useMapDashboard()
  const provinceCode = selectedArea.province?.code
  const regencyCode = selectedArea.regency?.code

  // Load all islands in a province that does not belong to any regency
  // Fetch the full list of islands that don't belong to any regency once and
  // cache it. We only enable this when a province is selected to avoid
  // fetching unnecessarily on initial load. Different provinces will reuse
  // the same cached list and we filter it locally instead of refetching.
  const allNoRegencyQuery = useQuery<Island[], Error>({
    queryKey: ['islands', 'without-regency'],
    queryFn: () => fetchIslandsRecursively(''),
    enabled: !!provinceCode,
    // keep it fresh for a while so switching provinces won't trigger refetch
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // derive province-level islands from the cached full list
  const provinceIslands = useMemo(() => {
    if (!provinceCode) return []
    const all: Island[] = (allNoRegencyQuery.data as Island[]) ?? []
    return all.filter((island: Island) =>
      island.code.startsWith(`${provinceCode}.00`),
    )
  }, [allNoRegencyQuery.data, provinceCode])

  // Load islands for a specific regency
  const regencyQuery = useQuery<Island[], Error>({
    queryKey: ['islands', 'regency', regencyCode],
    queryFn: () =>
      regencyCode ? fetchIslandsRecursively(regencyCode) : Promise.resolve([]),
    enabled: !!regencyCode,
  })

  // Compute aggregated islands from province + regency query results
  const islands = useMemo(() => {
    const prov = provinceIslands ?? []
    const reg = regencyQuery.data ?? []
    const map = new Map<string, Island>()

    // add province islands first
    prov.forEach((i) => {
      map.set(i.code, i)
    })
    // overlay regency islands (will replace duplicates)
    reg.forEach((i) => {
      map.set(i.code, i)
    })

    return Array.from(map.values())
  }, [provinceIslands, regencyQuery.data])

  const isLoading = allNoRegencyQuery.isLoading || regencyQuery.isLoading
  const isFetching = allNoRegencyQuery.isFetching || regencyQuery.isFetching
  const aggregatedError = [regencyQuery.error, allNoRegencyQuery.error].filter(
    Boolean,
  )

  return {
    data: islands,
    isLoading,
    isFetching,
    error: aggregatedError.length > 0 ? aggregatedError : null,
    refetch: () => {
      void allNoRegencyQuery.refetch()
      void regencyQuery.refetch()
    },
  }
}

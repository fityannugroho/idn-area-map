import { useQuery } from '@tanstack/react-query'
import { config } from '@/lib/config'
import { Area, type Island } from '@/lib/const'
import { getData } from '@/lib/data'

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

export function useIslands(regencyCode?: string) {
  return useQuery({
    queryKey: ['islands', { parentCode: regencyCode }],
    queryFn: () => fetchIslandsRecursively(regencyCode as string),
    enabled: !!regencyCode,
  })
}

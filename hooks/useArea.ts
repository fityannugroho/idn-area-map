import type { Areas } from '@/lib/const'
import { type Query, getData } from '@/lib/data'
import { useQuery } from '@tanstack/react-query'

export function useArea<A extends Areas>(area: A, query?: Query<A>) {
  return useQuery({
    queryKey: ['area', area, query],
    queryFn: async () => {
      const res = await getData(area, query)

      if ('data' in res) {
        return res.data
      }

      throw new Error(
        Array.isArray(res.message) ? res.message.join('\n') : res.message,
      )
    },
  })
}

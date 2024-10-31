import type { Areas } from '@/lib/const'
import {
  type GetDataReturn,
  type GetSpecificDataReturn,
  type Query,
  getData,
} from '@/lib/data'
import { useQuery } from '@tanstack/react-query'

export function useArea<A extends Areas, P extends string | Query<A>>(
  area: A,
  codeOrQuery?: P,
) {
  return useQuery({
    queryKey: ['area', area, codeOrQuery],
    queryFn: async () => {
      const res = await getData(area, codeOrQuery)

      if ('data' in res) {
        return res.data as P extends string
          ? GetSpecificDataReturn<A>['data']
          : GetDataReturn<A>['data']
      }

      throw new Error(
        Array.isArray(res.message) ? res.message.join('\n') : res.message,
      )
    },
  })
}

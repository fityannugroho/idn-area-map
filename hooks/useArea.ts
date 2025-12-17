import { useQuery } from '@tanstack/react-query'
import type { Area } from '@/lib/const'
import {
  type GetDataReturn,
  type GetSpecificDataReturn,
  getData,
  type Query,
} from '@/lib/data'

/**
 * Get area data from the API.
 *
 * Note: The request will be **disabled** if `codeOrQuery` is not provided.
 * To fetch all data (without filter), you must explicitly pass an empty object `{}`.
 *
 * @param area The area type (e.g. `province`, `regency`, etc.)
 * @param codeOrQuery The area code (string) to get specific data, or query params (object) to filter data.
 */
export function useArea<A extends Area, P extends string | Query<A>>(
  area: A,
  codeOrQuery?: P,
) {
  const enabled = codeOrQuery !== undefined

  return useQuery({
    queryKey: ['area', area, codeOrQuery],
    enabled,

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

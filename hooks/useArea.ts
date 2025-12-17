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
 * Note: The request will be **disabled** if `codeOrQuery` is explicitly set to `null`.
 *
 * @param area The area type (e.g. `province`, `regency`, etc.)
 * @param codeOrQuery The area code (string) to get specific data, or query params (object) to filter data. Pass `null` to disable.
 */
export function useArea<A extends Area, P extends string | Query<A> = Query<A>>(
  area: A,
  codeOrQuery?: P | null,
) {
  const enabled = codeOrQuery !== null

  return useQuery({
    queryKey: ['area', area, codeOrQuery],
    enabled,

    queryFn: async () => {
      if (codeOrQuery === null) {
        throw new Error('useArea is disabled')
      }

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

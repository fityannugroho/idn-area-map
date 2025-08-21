import { useQuery } from '@tanstack/react-query'
import type { Area } from '@/lib/const'
import { getBoundaryData } from '@/lib/data'

export default function useBoundary(area: Area, code: string) {
  return useQuery({
    queryKey: ['boundary', area, code],
    queryFn: async () => {
      const res = await getBoundaryData(area, code)

      if (res.data) {
        return res.data
      }

      throw new Error(
        res.statusCode === 404
          ? `Data not found for ${area} ${code}`
          : res.message || `Unexpected status code: ${res.statusCode}`,
      )
    },
  })
}

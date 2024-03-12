import MapDashboard from '@/components/map-dashboard'
import { Areas, singletonArea } from '@/lib/const'
import { getSpecificData } from '@/lib/data'
import { areaCodeSchema, determineAreaByCode } from '@/lib/utils'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

type Props = {
  params: {
    code: string
  }
}

async function getAreaData(area: Areas, areaCode: string) {
  const res = await getSpecificData(area, areaCode.replaceAll('.', ''))

  if (!('data' in res)) {
    if (res.statusCode === 404) {
      throw new Error(`There are no area with code '${areaCode}'`)
    }
    throw new Error(Array.isArray(res.message) ? res.message[0] : res.message)
  }

  return res.data
}

export default async function DetailAreaPage({ params }: Props) {
  let areaCode

  try {
    areaCode = areaCodeSchema.parse(params.code)
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodError(error)
    }
    throw error
  }

  const area = determineAreaByCode(areaCode)
  const { parent: parentAreas, ...areaData } = await getAreaData(area, areaCode)

  return (
    <MapDashboard
      defaultSelected={{
        [singletonArea[area]]: areaData,
        ...parentAreas,
      }}
    />
  )
}

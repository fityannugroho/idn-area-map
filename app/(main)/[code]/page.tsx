import MapDashboard from '@/components/map-dashboard'
import { Areas, singletonArea } from '@/lib/const'
import { getSpecificData } from '@/lib/data'
import { areaCodeSchema, determineAreaByCode } from '@/lib/utils'

type Props = {
  params: {
    code: string
  }
}

async function getAreaData(area: Areas, areaCode: string) {
  const res = await getSpecificData(area, areaCode.replaceAll('.', ''))

  if (!('data' in res)) {
    throw new Error('Data not found')
  }

  return res.data
}

export default async function SpecificAreaPage({ params }: Props) {
  const areaCode = areaCodeSchema.parse(params.code)
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

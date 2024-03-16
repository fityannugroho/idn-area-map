import MapDashboard from '@/components/map-dashboard'
import { config } from '@/lib/config'
import { Areas, singletonArea } from '@/lib/const'
import { getSpecificData } from '@/lib/data'
import { areaCodeSchema, determineAreaByCode, ucWords } from '@/lib/utils'
import { Metadata, ResolvingMetadata } from 'next'
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

export async function generateMetadata(
  { params: { code } }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const area = determineAreaByCode(code)
  const areaData = await getAreaData(area, code)

  const url = `${config.appUrl}/${areaData.code}`
  const parentNames = Object.keys(areaData.parent ?? {}).map((parent) =>
    parent === 'regency'
      ? ucWords(areaData.parent?.[parent]?.name ?? '')
      : areaData.parent?.[parent]?.name ?? '',
  )

  const areaNames = [
    area === 'regencies' ? ucWords(areaData.name) : areaData.name,
    ...parentNames,
  ].join(', ')

  const title = `${areaNames} | ${config.appName}`
  const description = `See the information about ${areaNames}, Indonesia.`
  const ogImage = `/api/og-image/area/${areaData.code}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage,
      url,
    },
    twitter: {
      title,
      description,
      images: ogImage,
      site: url,
    },
  }
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

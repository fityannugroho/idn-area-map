import MapDashboard from '@/components/map-dashboard'
import { config } from '@/lib/config'
import type { Area } from '@/lib/const'
import { type GetSpecificDataReturn, getData } from '@/lib/data'
import { determineAreaByCode, ucWords } from '@/lib/utils'
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    code: string
  }
}

async function getAreaData(
  area: Area,
  areaCode: string,
): Promise<GetSpecificDataReturn<Area>['data']> {
  const res = await getData(area, areaCode.replaceAll('.', ''))

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
  let area: Area
  let areaData: Awaited<ReturnType<typeof getAreaData>>

  try {
    area = determineAreaByCode(code)
    areaData = await getAreaData(area, code)
  } catch (error) {
    return {
      title: 'Area Not Found',
      description:
        'The area you are looking for does not exist. Ensure the link is correct or search the data manually in the Main Page.',
    }
  }

  const url = `${config.appUrl}/${areaData.code}`
  const parentNames = Object.keys(areaData.parent ?? {}).map((parent) =>
    parent === 'regency'
      ? ucWords(areaData.parent?.[parent]?.name ?? '')
      : (areaData.parent?.[parent as Area]?.name ?? ''),
  )

  const areaNames = [
    area === 'regency' ? ucWords(areaData.name) : areaData.name,
    ...parentNames,
  ].join(', ')

  const title = areaNames
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
  let area: Area
  let areaData: Awaited<ReturnType<typeof getAreaData>>

  try {
    area = determineAreaByCode(params.code)
    areaData = await getAreaData(area, params.code)
  } catch (error) {
    return notFound()
  }

  const { parent, ...data } = areaData

  return (
    <MapDashboard
      defaultSelected={{
        [area]: data,
        ...parent,
      }}
    />
  )
}

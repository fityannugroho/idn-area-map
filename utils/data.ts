import { config } from './config'

export type Province = {
  code: string
  name: string
}

export type Regency = {
  code: string
  name: string
  provinceCode: string
}

export type District = {
  code: string
  name: string
  regencyCode: string
}

export type Village = {
  code: string
  districtCode: string
  name: string
}

export type Island = {
  code: string
  coordinate: string
  isOutermostSmall: boolean
  isPopulated: boolean
  latitude: number
  longitude: number
  name: string
  regencyCode: string | null
}

export type Areas =
  | 'provinces'
  | 'regencies'
  | 'districts'
  | 'villages'
  | 'islands'

export type GetArea<Area> = Area extends 'provinces'
  ? Province
  : Area extends 'regencies'
    ? Regency
    : Area extends 'islands'
      ? Island
      : Area extends 'districts'
        ? District
        : Area extends 'villages'
          ? Village
          : never

export type Query<Area extends Areas> = {
  limit?: number
  name?: string
  page?: number
  parentCode?: Area extends 'provinces' ? never : string
  sortBy?: keyof GetArea<Area>
}

const parentCodeQueryKey = {
  regencies: 'provinceCode',
  islands: 'regencyCode',
  districts: 'regencyCode',
  villages: 'districtCode',
} as const

const baseUrl = config.dataSourceUrl

type GetDataReturn<Area extends Areas> = {
  statusCode: number
  message: string
  data: GetArea<Area>[]
  meta: {
    total: number
    pagination: {
      total: number
      pages: {
        first: number
        last: number
        current: number
        previous: number | null
        next: number | null
      }
    }
  }
}

export async function getData<Area extends Areas>(
  area: Area,
  query?: Query<Area>,
): Promise<GetDataReturn<Area>> {
  const url = new URL(`${baseUrl}/${area}`)

  if (query?.parentCode && area !== 'provinces') {
    url.searchParams.append(
      parentCodeQueryKey[area as Exclude<Areas, 'provinces'>],
      query.parentCode,
    )
  }

  if (query?.name) {
    url.searchParams.append('name', query.name)
  }

  if (query?.sortBy) {
    url.searchParams.append('sortBy', query.sortBy as string)
  }

  if (query?.limit) {
    url.searchParams.append('limit', query.limit.toString())
  }

  if (query?.page) {
    url.searchParams.append('page', query.page.toString())
  }

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Failed to fetch ${area} data`)
  }

  return await res.json()
}

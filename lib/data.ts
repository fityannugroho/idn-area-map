'use server'

import { config } from './config'
import { Areas, GetArea, parentArea, singletonArea } from './const'

export type Query<Area extends Areas> = {
  limit?: number
  name?: string
  page?: number
  parentCode?: Area extends 'provinces' ? never : string
  sortBy?: keyof GetArea<Area>
}

const { url: baseUrl } = config.dataSource

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

type GetDataReturnError = {
  statusCode: number
  message: string | string[]
  error: string
}

export async function getData<Area extends Areas>(
  area: Area,
  query?: Query<Area>,
): Promise<GetDataReturn<Area> | GetDataReturnError> {
  const url = new URL(`${baseUrl}/${area}`)
  const parent = parentArea[area]

  if (query?.parentCode && parent) {
    url.searchParams.append(`${singletonArea[parent]}Code`, query.parentCode)
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

  return await res.json()
}

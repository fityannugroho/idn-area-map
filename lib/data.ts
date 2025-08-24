import { config } from './config'
import { type Area, endpoints, type GetArea, parentArea } from './const'

export type Query<A extends Area> = {
  limit?: number
  name?: string
  page?: number
  parentCode?: A extends Area.PROVINCE ? never : string
  sortBy?: keyof GetArea<A>
}

const { url: baseUrl } = config.dataSource.area

export type GetDataReturn<A extends Area> = {
  statusCode: number
  message: string
  data: GetArea<A>[]
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

export type GetSpecificDataReturn<A extends Area> = {
  statusCode: number
  message: string
  data: GetArea<A> & {
    parent?: {
      [P in Area]?: GetArea<P>
    }
  }
}

export type GetDataReturnError = {
  statusCode: number
  message: string | string[]
  error: string
}

/**
 * Get data from the API.
 * Provide the `code` to get specific data or provide the `query` to get multiple data.
 */
export async function getData<A extends Area, P extends string | Query<A>>(
  area: A,
  codeOrQuery?: P,
): Promise<
  | (P extends string ? GetSpecificDataReturn<A> : GetDataReturn<A>)
  | GetDataReturnError
> {
  let code: string | undefined
  let query: Query<A> | undefined

  if (typeof codeOrQuery === 'string') {
    code = codeOrQuery
  } else {
    query = codeOrQuery
  }

  const endpoint = endpoints[area]
  const url = new URL(
    code ? `${baseUrl}/${endpoint}/${code}` : `${baseUrl}/${endpoint}`,
  )
  const parent = parentArea[area]

  // Allow empty string on `parentCode` query
  if (query?.parentCode != null && parent) {
    url.searchParams.append(`${parent}Code`, query.parentCode)
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

  let res: Response
  try {
    res = await fetch(url)
  } catch (_error) {
    return {
      statusCode: 500,
      message: `Unable to connect to the server at ${url.host}. Please check your network connection or verify that the server is reachable.`,
      error: (_error as Error).message,
    }
  }

  if (!res.ok) {
    const errorMessage = await res.text()
    return {
      statusCode: res.status,
      message: `Failed to fetch data, ${errorMessage}`,
      error: res.statusText,
    }
  }

  return await res.json()
}

type BoundaryResponse = {
  statusCode: number
  message: string
  data: GeoJSON.Feature<GeoJSON.MultiPolygon> | undefined
}

export async function getBoundaryData(
  area: Area,
  code: string,
): Promise<BoundaryResponse> {
  const url = new URL(
    `${config.dataSource.boundary.url}/${endpoints[area]}/${code}.geojson`,
  )

  let res: Response
  try {
    res = await fetch(url)
  } catch (_error) {
    return {
      statusCode: 500,
      message: `Unable to connect to the server at ${url.host}. Please check your network connection or verify that the server is reachable.`,
      data: undefined,
    }
  }

  return {
    statusCode: res.status,
    message: res.statusText,
    data: res.ok ? await res.json() : undefined,
  }
}

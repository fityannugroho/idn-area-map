'use server'

import { get } from 'node:https'
import { NextResponse } from 'next/server'
import { config } from './config'
import { type Areas, type GetArea, parentArea, singletonArea } from './const'
import { addDotSeparator } from './utils'

export type Query<Area extends Areas> = {
  limit?: number
  name?: string
  page?: number
  parentCode?: Area extends 'provinces' ? never : string
  sortBy?: keyof GetArea<Area>
}

const { url: baseUrl } = config.dataSource.area

export type GetDataReturn<Area extends Areas> = {
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

export type GetSpecificDataReturn<Area extends Areas> = {
  statusCode: number
  message: string
  data: GetArea<Area> & {
    parent?: {
      [P in Areas as (typeof singletonArea)[P]]?: GetArea<P>
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
export async function getData<
  Area extends Areas,
  P extends string | Query<Area>,
>(
  area: Area,
  codeOrQuery?: P,
): Promise<
  | (P extends string ? GetSpecificDataReturn<Area> : GetDataReturn<Area>)
  | GetDataReturnError
> {
  let code: string | undefined
  let query: Query<Area> | undefined

  if (typeof codeOrQuery === 'string') {
    code = codeOrQuery
  } else {
    query = codeOrQuery
  }

  const url = new URL(
    code ? `${baseUrl}/${area}/${code}` : `${baseUrl}/${area}`,
  )
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

export async function getBoundaryData(area: Areas, code: string) {
  const url = `${config.dataSource.boundary.url}/${area}/${addDotSeparator(code.replaceAll('.', ''))}.geojson`

  return new Promise<NextResponse>((resolve, reject) => {
    // Create encoding to convert token (string) to Uint8Array
    const encoder = new TextEncoder()

    // Create a TransformStream for writing the response as the tokens as generated
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(
          NextResponse.json(
            {
              statusCode: res.statusCode,
              message: res.statusMessage,
            },
            { status: res.statusCode },
          ),
        )
      }

      res.on('data', (chunk) => {
        writer.write(encoder.encode(chunk))
      })

      res.on('end', () => {
        writer.close()
        resolve(new NextResponse(stream.readable, { status: res.statusCode }))
      })

      res.on('error', (error) => {
        writer.close()
        reject('Error occurred while fetching data')
      })
    })
  })
}

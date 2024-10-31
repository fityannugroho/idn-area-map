'use server'

import { get } from 'node:https'
import { NextResponse } from 'next/server'
import { config } from './config'
import { type Area, type GetArea, endpoints, parentArea } from './const'
import { addDotSeparator } from './utils'

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

  if (query?.parentCode && parent) {
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

  const res = await fetch(url)

  return await res.json()
}

export async function getBoundaryData(area: Area, code: string) {
  const url = `${config.dataSource.boundary.url}/${endpoints[area]}/${addDotSeparator(code.replaceAll('.', ''))}.geojson`

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

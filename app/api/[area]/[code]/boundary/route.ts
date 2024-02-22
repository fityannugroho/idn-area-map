import { NextRequest } from 'next/server'
import { z } from 'zod'
import { get } from 'https'
import { Params, paramSchema } from './schema'
import { addDotSeparator } from '@/lib/utils'

const ghRawBaseUrl =
  'https://raw.githubusercontent.com/fityannugroho/idn-area-boundary/main/data'

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  let validatedParams: Params
  try {
    validatedParams = paramSchema.parse(params)
  } catch (error) {
    return new Response(
      JSON.stringify({
        statusCode: 400,
        message: 'Bad Request',
        ...(error instanceof z.ZodError && { error: error.errors }),
      }),
      { status: 400 },
    )
  }

  const { area, code } = validatedParams
  const url = `${ghRawBaseUrl}/${area}/${addDotSeparator(code)}.geojson`

  return new Promise<Response>((resolve, reject) => {
    // Create encoding to convert token (string) to Uint8Array
    const encoder = new TextEncoder()

    // Create a TransformStream for writing the response as the tokens as generated
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(
          new Response(
            JSON.stringify({
              statusCode: res.statusCode,
              message: res.statusMessage,
            }),
            { status: res.statusCode },
          ),
        )
      }

      res.on('data', (chunk) => {
        writer.write(encoder.encode(chunk))
      })

      res.on('end', () => {
        writer.close()
        resolve(new Response(stream.readable, { status: res.statusCode }))
      })

      res.on('error', (error) => {
        writer.close()
        reject('Error occurred while fetching data')
      })
    })
  })
}

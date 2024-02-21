import { NextRequest } from 'next/server'
import { z } from 'zod'

const ghRawBaseUrl =
  'https://raw.githubusercontent.com/fityannugroho/idn-area-boundary/main/data'

const areas = ['provinces', 'regencies', 'districts', 'villages'] as const

const paramSchema = z
  .object({
    /**
     * Area type
     */
    area: z.enum(areas),
    /**
     * Area code (numeric string)
     */
    code: z.string().regex(/^\d+$/),
  })
  .refine(
    (data) => {
      // Validate code length based on area type
      if (data.area === 'provinces') return data.code.length === 2
      if (data.area === 'regencies') return data.code.length === 4
      if (data.area === 'districts') return data.code.length === 6
      if (data.area === 'villages') return data.code.length === 10
      return false
    },
    {
      message: 'Invalid code length',
    },
  )

type Params = z.infer<typeof paramSchema>

/**
 * Add dot separator to the code.
 * - 4 digits (e.g. 9603) becomes 5 digits (e.g. 96.03)
 * - 6 digits (e.g. 960301) becomes 8 digits (e.g. 96.03.01)
 * - 10 digits (e.g. 9603011001) becomes 12 digits (e.g. 96.03.01.1001)
 */
function addDotSeparator(code: string) {
  const codeLength = code.length

  if (codeLength === 4) return `${code.slice(0, 2)}.${code.slice(2)}`
  if (codeLength === 6)
    return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4)}`
  if (codeLength === 10)
    return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4, 6)}.${code.slice(6)}`

  return code
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  let validatedParams: Params
  try {
    validatedParams = paramSchema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        statusCode: 400,
        message: 'Bad Request',
        error: error.errors,
      })
    }

    return Response.json({
      statusCode: 400,
      message: 'Bad Request',
    })
  }

  const { area, code } = validatedParams
  const url = `${ghRawBaseUrl}/${area}/${addDotSeparator(code)}.geojson`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'idn-area-boundary',
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })

  if (!response.ok) {
    return Response.json({
      statusCode: response.status,
      message: response.statusText,
    })
  }

  return Response.json({
    statusCode: 200,
    data: await response.json(),
  })
}

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Params, paramSchema } from './schema'
import { getBoundaryData } from '@/lib/data'

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
  return getBoundaryData(area, code)
}

import { getBoundaryData } from '@/lib/data'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { type Params, paramSchema } from './schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  let validatedParams: Params
  try {
    validatedParams = paramSchema.parse(params)
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: 'Bad Request',
        ...(error instanceof z.ZodError && { error: error.errors }),
      },
      { status: 400 },
    )
  }

  const { area, code } = validatedParams
  return getBoundaryData(area, code)
}

import { NextResponse } from 'next/server'
import { config, type FeatureArea, featureConfig } from '@/lib/config'
import type { Area } from '@/lib/const'
import { getBoundaryData } from '@/lib/data'
import { generateMapboxStaticMap, isMapboxEnabled } from '@/lib/mapbox'
import { determineAreaByCode } from '@/lib/utils'

export const size = {
  width: 800,
  height: 400,
}

export const contentType = 'image/png'

// Cache the OG image for 7 days (604800 seconds)
// This prevents regenerating the same image on every request
export const revalidate = 604800

/**
 * Read the static fallback OG image
 */
async function getFallbackImage(): Promise<Uint8Array> {
  try {
    // Fetch the static fallback image from the app URL (works on Cloudflare/Edge)
    const url = new URL('/opengraph-image.png', config.appUrl)
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Failed to fetch fallback image: ${res.statusText}`)
    }

    const buffer = await res.arrayBuffer()
    return new Uint8Array(buffer)
  } catch (error) {
    // If fetch fails, throw error with context
    console.error('Failed to fetch fallback image', error)
    throw new Error(`Fallback image not available`)
  }
}

/**
 * Generate a response with the fallback image
 */
async function generateFallbackResponse(
  options: { status?: number; errorResponse?: Record<string, unknown> } = {},
): Promise<NextResponse> {
  try {
    const fallbackImage = new Uint8Array(await getFallbackImage())
    return new NextResponse(fallbackImage, {
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error) {
    const { status = 503, errorResponse } = options
    if (errorResponse) {
      return NextResponse.json(errorResponse, {
        status,
        headers: { 'content-type': 'application/json' },
      })
    }
    return NextResponse.json({ message: (error as Error).message }, { status })
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  // Determine area type
  let area: Area
  try {
    area = determineAreaByCode(code)
  } catch {
    return NextResponse.json({ message: 'Invalid area code' }, { status: 400 })
  }

  // Areas without feature configuration (like islands) don't have boundary data
  if (!(area in featureConfig)) {
    return generateFallbackResponse()
  }

  // If Mapbox is not enabled, return static fallback
  if (!isMapboxEnabled()) {
    return generateFallbackResponse()
  }

  // Fetch boundary data
  const config = featureConfig[area as FeatureArea]
  const resBoundary = await getBoundaryData(area, code)

  if (!resBoundary.data) {
    // On error fetching boundary, fall back to static image
    return generateFallbackResponse({
      status: resBoundary.statusCode,
      errorResponse: resBoundary,
    })
  }

  // Generate Mapbox static map
  // Let generateMapboxStaticMap handle progressive simplification
  try {
    const imgBuffer = await generateMapboxStaticMap(
      resBoundary.data,
      config,
      size,
    )
    return new NextResponse(new Uint8Array(imgBuffer), {
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error) {
    // If Mapbox fails, fall back to static image
    console.error('Mapbox API error:', error)
    return generateFallbackResponse({ status: 500 })
  }
}

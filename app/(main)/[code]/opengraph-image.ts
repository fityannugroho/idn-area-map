import { promises as fs } from 'node:fs'
import { NextResponse } from 'next/server'
// @ts-expect-error
import simplify from 'simplify-geojson'
import type { FeatureArea } from '@/lib/config'
import { featureConfig } from '@/lib/config'
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
    // Try to read the static fallback image (works on Node.js/Vercel)
    const path = await import('node:path')
    const imagePath = path.join(process.cwd(), 'app', 'opengraph-image.png')
    const buffer = await fs.readFile(imagePath)
    return new Uint8Array(buffer)
  } catch (_error) {
    // If fs is not available (e.g., Cloudflare Workers), throw error
    // The caller should handle this by returning an error response
    throw new Error('Fallback image not available in this environment')
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
  } catch (_error) {
    return NextResponse.json({ message: 'Invalid area code' }, { status: 400 })
  }

  // If Mapbox is not enabled, return static fallback
  if (!isMapboxEnabled()) {
    try {
      const fallbackImage = await getFallbackImage()
      const body = new Uint8Array(fallbackImage)
      return new NextResponse(body, {
        headers: {
          'content-type': contentType,
        },
      })
    } catch (_error) {
      // If fallback fails, return error
      return NextResponse.json(
        { message: 'OG image generation not configured' },
        { status: 503 },
      )
    }
  }

  // Fetch boundary data
  const config = featureConfig[area as FeatureArea]
  const resBoundary = await getBoundaryData(area, code)

  if (!resBoundary.data) {
    // On error fetching boundary, fall back to static image
    try {
      const fallbackImage = await getFallbackImage()
      const body = new Uint8Array(fallbackImage)
      return new NextResponse(body, {
        headers: {
          'content-type': contentType,
        },
      })
    } catch (_error) {
      return NextResponse.json(resBoundary, {
        status: resBoundary.statusCode,
        statusText: resBoundary.message,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  // Simplify the boundary to reduce coordinate count
  const boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> =
    simplify(resBoundary.data, config.simplification.tolerance)

  // Generate Mapbox static map
  try {
    const imgBuffer = await generateMapboxStaticMap(boundary, config, size)
    const body = new Uint8Array(imgBuffer)

    return new NextResponse(body, {
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error) {
    // If Mapbox fails, fall back to static image
    console.error('Mapbox API error:', error)
    try {
      const fallbackImage = await getFallbackImage()
      const body = new Uint8Array(fallbackImage)
      return new NextResponse(body, {
        headers: {
          'content-type': contentType,
        },
      })
    } catch (_fallbackError) {
      return NextResponse.json(
        { message: 'Failed to generate OG image' },
        { status: 500 },
      )
    }
  }
}

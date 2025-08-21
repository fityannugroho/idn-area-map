import { type FeatureArea, featureConfig } from '@/lib/config'
import type { Area } from '@/lib/const'
import { getBoundaryData } from '@/lib/data'
import { determineAreaByCode } from '@/lib/utils'
import { NextResponse } from 'next/server'
// @ts-ignore
import simplify from 'simplify-geojson'
import StaticMaps, { type AddPolygonOptions } from 'staticmaps'

function countPositionInCoords(coord: GeoJSON.Position[][]) {
  return coord.reduce((acc, curr) => acc + curr.length, 0)
}

/**
 * The maximum number of polygons that can be added to the map.
 */
const maxPolygon = 30

export const size = {
  width: 800,
  height: 400,
}

export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  let area: Area
  try {
    area = determineAreaByCode(code)
  } catch (error) {
    // Return a simple error image
    return NextResponse.json({ message: 'Invalid area code' }, { status: 400 })
  }

  const config = featureConfig[area as FeatureArea]
  const resBoundary = await getBoundaryData(area, code)

  if (!resBoundary.data) {
    // Return a simple error image
    return NextResponse.json(resBoundary, {
      status: resBoundary.statusCode,
      statusText: resBoundary.message,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Simplify the boundary to reduce the number of coordinates
  const boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> =
    simplify(resBoundary.data, config.simplification.tolerance)

  const map = new StaticMaps({
    width: size.width,
    height: size.height,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileSubdomains: ['a', 'b', 'c'],
  })

  const lineOptions: Omit<AddPolygonOptions, 'coords'> = {
    width: 2,
    color: config.color,
    fill: config.fillColor,
  } as const

  switch (boundary.geometry.type) {
    case 'MultiPolygon': {
      // Sort the coordinates by the number of positions (the largest first)
      const sortedCoordsFromLargest = [...boundary.geometry.coordinates].sort(
        (a, b) => countPositionInCoords(b) - countPositionInCoords(a),
      )

      for (let index = 0; index < sortedCoordsFromLargest.length; index += 1) {
        // Limit the number of polygons to prevent `RangeError: Maximum call stack size exceeded`
        if (index === maxPolygon) {
          break
        }

        map.addMultiPolygon({
          // @ts-expect-error
          coords: sortedCoordsFromLargest[index],
          ...lineOptions,
        })
      }
      break
    }
    case 'Polygon':
      map.addMultiPolygon({
        // @ts-expect-error
        coords: boundary.geometry.coordinates,
        ...lineOptions,
      })
      break
  }

  await map.render()

  const imgBuffer = await map.image.buffer(contentType)
  const body = new Uint8Array(imgBuffer)

  return new NextResponse(body, {
    headers: {
      'content-type': contentType,
    },
  })
}

// @ts-expect-error
import simplify from 'simplify-geojson'

/**
 * Truncate coordinates to a specified precision to save URL space
 */
export function truncateCoordinates(coords: number[], precision = 4): number[] {
  return coords.map((n) => Number(n.toFixed(precision)))
}

/**
 * Recursively truncate all coordinates in a GeoJSON geometry
 */
export function truncateGeometryCoordinates(
  geometry: GeoJSON.Geometry,
  precision = 4,
): GeoJSON.Geometry {
  if (geometry.type === 'Point') {
    return {
      ...geometry,
      coordinates: truncateCoordinates(geometry.coordinates, precision),
    }
  }

  if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((coord) =>
        truncateCoordinates(coord, precision),
      ),
    }
  }

  if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) =>
        ring.map((coord) => truncateCoordinates(coord, precision)),
      ),
    }
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) =>
          ring.map((coord) => truncateCoordinates(coord, precision)),
        ),
      ),
    }
  }

  // GeometryCollection
  if (geometry.type === 'GeometryCollection') {
    return {
      ...geometry,
      geometries: geometry.geometries.map((g) =>
        truncateGeometryCoordinates(g, precision),
      ),
    }
  }

  return geometry
}

/**
 * Calculate a proxy for polygon area using its bounding box.
 * Used for sorting polygons by perceived importance.
 */
export function calculatePolygonAreaProxy(
  polygon: GeoJSON.Position[][],
): number {
  let minLon = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY

  for (const ring of polygon) {
    for (const coord of ring) {
      minLon = Math.min(minLon, coord[0])
      maxLon = Math.max(maxLon, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLat = Math.max(maxLat, coord[1])
    }
  }

  return (maxLon - minLon) * (maxLat - minLat)
}

/**
 * Sort polygons by area proxy descending.
 */
export function sortPolygonsByArea(
  polygons: GeoJSON.Position[][][],
): GeoJSON.Position[][][] {
  return [...polygons].sort(
    (a, b) => calculatePolygonAreaProxy(b) - calculatePolygonAreaProxy(a),
  )
}

/**
 * Limit MultiPolygon to the largest N polygons by area.
 */
export function limitPolygons(
  multiPolygon: GeoJSON.Feature<GeoJSON.MultiPolygon>,
  max = 30,
  preSortedCoordinates?: GeoJSON.Position[][][],
): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const sortedPolygons =
    preSortedCoordinates ||
    sortPolygonsByArea(multiPolygon.geometry.coordinates)

  return {
    ...multiPolygon,
    geometry: {
      ...multiPolygon.geometry,
      coordinates: sortedPolygons.slice(0, max),
    },
  }
}

/**
 * Filter out degenerate polygons (with < 4 coordinates) from a MultiPolygon or Polygon.
 * A valid polygon ring must have at least 4 coordinates (3 unique points + closing point).
 */
export function filterDegeneratePolygons(
  feature: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
): GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> {
  if (feature.geometry.type === 'Polygon') {
    // Filter rings with >= 4 coordinates
    const validRings = feature.geometry.coordinates.filter(
      (ring) => ring.length >= 4,
    )

    if (validRings.length === 0) {
      throw new Error(
        'No valid polygon rings after filtering degenerate polygons',
      )
    }

    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: validRings,
      },
    }
  }

  if (feature.geometry.type === 'MultiPolygon') {
    // Filter polygons with at least one ring with >= 4 coordinates
    const validPolygons = feature.geometry.coordinates
      .map((polygon) => polygon.filter((ring) => ring.length >= 4))
      .filter((polygon) => polygon.length > 0)

    if (validPolygons.length === 0) {
      throw new Error('No valid polygons after filtering degenerate polygons')
    }

    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: validPolygons,
      },
    }
  }

  return feature
}

function ensureClosedRing(ring: GeoJSON.Position[]): GeoJSON.Position[] {
  if (ring.length === 0) {
    throw new Error('Polygon ring is empty')
  }

  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring
  }

  return [...ring, first]
}

function encodeSignedValue(value: number): string {
  let num = value < 0 ? ~(value << 1) : value << 1
  let encoded = ''

  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63)
    num >>= 5
  }

  encoded += String.fromCharCode(num + 63)
  return encoded
}

export function encodePolyline(ring: GeoJSON.Position[]): string {
  const closedRing = ensureClosedRing(ring)
  let lastLat = 0
  let lastLng = 0
  let result = ''

  for (const coord of closedRing) {
    const lat = Math.round(coord[1] * 1e5)
    const lng = Math.round(coord[0] * 1e5)
    const deltaLat = lat - lastLat
    const deltaLng = lng - lastLng

    result += encodeSignedValue(deltaLat)
    result += encodeSignedValue(deltaLng)

    lastLat = lat
    lastLng = lng
  }

  return result
}

/**
 * Build a bounding box string from a GeoJSON geometry
 */
export function getBoundingBox(
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon,
): [number, number, number, number] {
  let minLon = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY

  const processCoord = (coord: GeoJSON.Position) => {
    minLon = Math.min(minLon, coord[0])
    maxLon = Math.max(maxLon, coord[0])
    minLat = Math.min(minLat, coord[1])
    maxLat = Math.max(maxLat, coord[1])
  }

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const coord of ring) {
        processCoord(coord)
      }
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) {
          processCoord(coord)
        }
      }
    }
  }

  return [minLon, minLat, maxLon, maxLat]
}

/**
 * Get the outer rings of the largest N polygons
 */
export function getMajorRings(
  feature: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  maxCount = 50,
  preSortedCoordinates?: GeoJSON.Position[][][],
): GeoJSON.Position[][] {
  if (feature.geometry.type === 'Polygon') {
    return [feature.geometry.coordinates[0]]
  }

  const sortedPolygons =
    preSortedCoordinates || sortPolygonsByArea(feature.geometry.coordinates)

  return sortedPolygons.slice(0, maxCount).map((p) => p[0])
}

export function simplifyBoundary(
  boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  tolerance: number,
): GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> {
  try {
    return simplify(boundary, tolerance) as GeoJSON.Feature<
      GeoJSON.MultiPolygon | GeoJSON.Polygon
    >
  } catch (_error) {
    // If simplification fails, return the original boundary
    return boundary
  }
}

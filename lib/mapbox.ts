// @ts-expect-error
import simplify from 'simplify-geojson'
import type { FeatureConfig } from './config'
import { config } from './config'

/**
 * The maximum URL length allowed by Mapbox Static Images API
 */
const MAX_URL_LENGTH = 8192

/**
 * The maximum number of polygons to include in the overlay.
 * Mirrors the current staticmaps behavior.
 */
const MAX_POLYGONS = 30

/**
 * Check if Mapbox is enabled by verifying the access token is set
 */
export function isMapboxEnabled(): boolean {
  return Boolean(config.mapbox.accessToken)
}

/**
 * Truncate coordinates to a specified precision to save URL space
 */
export function truncateCoordinates(coords: number[], precision = 4): number[] {
  return coords.map((n) => Number(n.toFixed(precision)))
}

/**
 * Recursively truncate all coordinates in a GeoJSON geometry
 */
function truncateGeometryCoordinates(
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
function calculatePolygonAreaProxy(polygon: GeoJSON.Position[][]): number {
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
 * Limit MultiPolygon to the largest N polygons by area.
 */
export function limitPolygons(
  multiPolygon: GeoJSON.Feature<GeoJSON.MultiPolygon>,
  max = MAX_POLYGONS,
): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const sortedPolygons = [...multiPolygon.geometry.coordinates].sort(
    (a, b) => calculatePolygonAreaProxy(b) - calculatePolygonAreaProxy(a),
  )

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

/**
 * Convert fill color with alpha (e.g., "#2563eb33") to separate fill and fill-opacity
 */
function parseFillColor(fillColor: string): {
  fill: string
  fillOpacity: number
} {
  // Handle 8-character hex (#RRGGBBAA) or 4-character hex (#RGBA)
  if (fillColor.length === 9) {
    // #RRGGBBAA
    const fill = fillColor.slice(0, 7) // #RRGGBB
    const alphaHex = fillColor.slice(7, 9)
    const fillOpacity = Number.parseInt(alphaHex, 16) / 255
    return { fill, fillOpacity }
  }

  if (fillColor.length === 5) {
    // #RGBA
    const fill = `#${fillColor[1]}${fillColor[1]}${fillColor[2]}${fillColor[2]}${fillColor[3]}${fillColor[3]}`
    const alphaHex = `${fillColor[4]}${fillColor[4]}`
    const fillOpacity = Number.parseInt(alphaHex, 16) / 255
    return { fill, fillOpacity }
  }

  // No alpha, default opacity
  return { fill: fillColor, fillOpacity: 0.6 }
}

/**
 * Convert a GeoJSON boundary to simplestyle-spec format for Mapbox overlay
 */
export function toSimplestyleGeoJSON(
  boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  featureConfig: FeatureConfig[keyof FeatureConfig],
): GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> {
  const { fill, fillOpacity } = parseFillColor(featureConfig.fillColor)

  return {
    type: 'Feature',
    properties: {
      // Only include simplestyle properties to minimize URL length
      stroke: featureConfig.color,
      'stroke-width': 2,
      'stroke-opacity': 1.0,
      fill,
      'fill-opacity': fillOpacity,
    },
    // Truncate coordinates to 3 decimals (~111m precision) to save URL space
    geometry: truncateGeometryCoordinates(boundary.geometry, 3) as
      | GeoJSON.MultiPolygon
      | GeoJSON.Polygon,
  }
}

function normalizeHexColor(color: string): string {
  return color.startsWith('#') ? color.slice(1) : color
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

export function buildPathOverlayUrl(
  rings: GeoJSON.Position[][],
  featureConfig: FeatureConfig[keyof FeatureConfig],
  size: { width: number; height: number },
): string {
  const token = config.mapbox.accessToken
  if (!token) {
    throw new Error('Mapbox access token is not configured')
  }

  const { fill, fillOpacity } = parseFillColor(featureConfig.fillColor)
  const strokeColor = normalizeHexColor(featureConfig.color)
  const fillColor = normalizeHexColor(fill)
  const strokeOpacity = 1

  // Mapbox supports multiple overlays separated by comma
  const overlays = rings
    .map((ring) => {
      // For polyline encoding, 4 decimal places (~11m) is plenty for OG images
      // and significantly reduces the encoded string length compared to 5
      const truncatedRing = ring.map(
        (coord) => truncateCoordinates(coord, 4) as GeoJSON.Position,
      )
      const encodedPolyline = encodeURIComponent(encodePolyline(truncatedRing))
      return `path-2+${strokeColor}-${strokeOpacity}+${fillColor}-${fillOpacity}(${encodedPolyline})`
    })
    .join(',')

  const url = new URL(
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/${size.width}x${size.height}`,
  )
  url.searchParams.set('access_token', token)
  url.searchParams.set('padding', '20')
  url.searchParams.set('attribution', 'false')
  url.searchParams.set('logo', 'false')

  return url.toString()
}

/**
 * Build a Mapbox Static Images API URL
 */
export function buildMapboxStaticUrl(
  geojson: GeoJSON.Feature | GeoJSON.FeatureCollection,
  size: { width: number; height: number },
): string {
  const token = config.mapbox.accessToken
  if (!token) {
    throw new Error('Mapbox access token is not configured')
  }

  const geoJsonString = JSON.stringify(geojson)
  const encodedGeoJson = encodeURIComponent(geoJsonString)

  const url = new URL(
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${encodedGeoJson})/auto/${size.width}x${size.height}`,
  )
  url.searchParams.set('access_token', token)
  url.searchParams.set('padding', '20')
  url.searchParams.set('attribution', 'false')
  url.searchParams.set('logo', 'false')

  return url.toString()
}

/**
 * Fetch a static map image from Mapbox
 */
export async function fetchMapboxImage(url: string): Promise<Uint8Array> {
  const res = await fetch(url)

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Mapbox API error (${res.status}): ${res.statusText}. ${errorText}`,
    )
  }

  const buffer = await res.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Build a bounding box string from a GeoJSON geometry (fallback when URL is too long)
 */
function getBoundingBox(
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
function getMajorRings(
  feature: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  maxCount = 50,
): GeoJSON.Position[][] {
  if (feature.geometry.type === 'Polygon') {
    return [feature.geometry.coordinates[0]]
  }

  const sortedPolygons = [...feature.geometry.coordinates].sort(
    (a, b) => calculatePolygonAreaProxy(b) - calculatePolygonAreaProxy(a),
  )

  return sortedPolygons.slice(0, maxCount).map((p) => p[0])
}

function simplifyBoundary(
  boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  tolerance: number,
): GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon> {
  return simplify(boundary, tolerance) as GeoJSON.Feature<
    GeoJSON.MultiPolygon | GeoJSON.Polygon
  >
}

function buildSimplificationAttempts(baseTolerance: number): number[] {
  const attempts = [baseTolerance * 2, baseTolerance * 4, baseTolerance * 8]
  if (baseTolerance < 0.02) {
    attempts.push(0.02, 0.05, 0.1)
  }

  return Array.from(new Set(attempts.filter((value) => value > 0))).sort(
    (a, b) => a - b,
  )
}

/**
 * Build a bbox-based Mapbox URL (no GeoJSON overlay, just the map area)
 */
function buildBboxUrl(
  bbox: [number, number, number, number],
  size: { width: number; height: number },
): string {
  const token = config.mapbox.accessToken
  if (!token) {
    throw new Error('Mapbox access token is not configured')
  }

  const url = new URL(
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/[${bbox.join(',')}]/${size.width}x${size.height}`,
  )
  url.searchParams.set('access_token', token)
  url.searchParams.set('padding', '20')
  url.searchParams.set('attribution', 'false')
  url.searchParams.set('logo', 'false')

  return url.toString()
}

/**
 * Generate a Mapbox static map URL with progressive simplification to fit URL length limit
 */
export async function generateMapboxStaticMap(
  boundary: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>,
  featureConfig: FeatureConfig[keyof FeatureConfig],
  size: { width: number; height: number },
): Promise<Uint8Array> {
  // Filter out degenerate polygons first (those with < 4 coordinates)
  const filtered = filterDegeneratePolygons(boundary)
  const isMulti = filtered.geometry.type === 'MultiPolygon'
  const totalIslands = isMulti ? filtered.geometry.coordinates.length : 1

  // 1. HIGH QUALITY: GeoJSON (Max 50 polygons)
  let limitedGeo = filtered
  if (isMulti) {
    limitedGeo = limitPolygons(
      filtered as GeoJSON.Feature<GeoJSON.MultiPolygon>,
      50,
    )
  }
  const styledGeoJson = toSimplestyleGeoJSON(limitedGeo, featureConfig)
  const initialGeoUrl = buildMapboxStaticUrl(styledGeoJson, size)

  // Use GeoJSON if it's single-polygon or fits all islands perfectly
  if (
    initialGeoUrl.length <= MAX_URL_LENGTH &&
    (!isMulti || totalIslands <= 50)
  ) {
    return fetchMapboxImage(initialGeoUrl)
  }

  // 2. HIGH COVERAGE: Encoded Polyline (Up to 100 islands)
  // This is much more efficient than GeoJSON for archipelagos
  if (isMulti) {
    const islandCounts = [100, 75, 50, 30]
    for (const count of islandCounts) {
      const rings = getMajorRings(filtered, count)
      const pathUrl = buildPathOverlayUrl(rings, featureConfig, size)
      if (pathUrl.length <= MAX_URL_LENGTH) {
        return fetchMapboxImage(pathUrl)
      }
    }
  }

  // 3. ADAPTIVE DETAIL: Progressive Simplification while keeping major islands
  // Instead of dropping islands, we make them "coarser" to fit the URL
  const simplificationAttempts = buildSimplificationAttempts(
    featureConfig.simplification.tolerance,
  )
  for (const tolerance of simplificationAttempts) {
    const simplified = simplifyBoundary(filtered, tolerance)
    const cleaned = filterDegeneratePolygons(simplified)
    // Try to keep at least 30 islands even if we have to simplify them
    const rings = getMajorRings(cleaned, 30)
    const simplifiedUrl = buildPathOverlayUrl(rings, featureConfig, size)

    if (simplifiedUrl.length <= MAX_URL_LENGTH) {
      return fetchMapboxImage(simplifiedUrl)
    }
  }

  // 4. LOW COVERAGE: Reduce island count as a last resort (15, 10, 5, 3, 1)
  if (isMulti) {
    const emergencyCounts = [15, 10, 5, 3, 1]
    for (const count of emergencyCounts) {
      const rings = getMajorRings(filtered, count)
      const pathUrl = buildPathOverlayUrl(rings, featureConfig, size)
      if (pathUrl.length <= MAX_URL_LENGTH) {
        return fetchMapboxImage(pathUrl)
      }
    }
  }

  // 5. ABSOLUTE FALLBACK: Bounding Box
  const bbox = getBoundingBox(filtered.geometry)
  const finalFallbackUrl = buildBboxUrl(bbox, size)

  return fetchMapboxImage(finalFallbackUrl)
}

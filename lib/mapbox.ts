import type { FeatureConfig } from './config'
import { config } from './config'
import {
  encodePolyline,
  filterDegeneratePolygons,
  getBoundingBox,
  getMajorRings,
  limitPolygons,
  simplifyBoundary,
  sortPolygonsByArea,
  truncateCoordinates,
  truncateGeometryCoordinates,
} from './geojson'

/**
 * The maximum URL length allowed by Mapbox Static Images API
 */
const MAX_URL_LENGTH = 8192

/**
 * Check if Mapbox is enabled by verifying the access token is set
 */
export function isMapboxEnabled(): boolean {
  return Boolean(config.mapbox.accessToken)
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
    // Truncate coordinates to 4 decimals (~11m precision) to save URL space
    geometry: truncateGeometryCoordinates(boundary.geometry, 4) as
      | GeoJSON.MultiPolygon
      | GeoJSON.Polygon,
  }
}

function normalizeHexColor(color: string): string {
  return color.startsWith('#') ? color.slice(1) : color
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
  const opacity = Number(fillOpacity.toFixed(2))

  // Mapbox supports multiple overlays separated by comma
  const overlays = rings
    .map((ring) => {
      // For polyline encoding, 4 decimal places (~11m) is plenty for OG images
      // and significantly reduces the encoded string length compared to 5
      const truncatedRing = ring.map(
        (coord) => truncateCoordinates(coord, 4) as GeoJSON.Position,
      )
      const encodedPolyline = encodeURIComponent(encodePolyline(truncatedRing))
      return `path-2+${strokeColor}-${strokeOpacity}+${fillColor}-${opacity}(${encodedPolyline})`
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

  // Pre-sort polygons by area once to avoid redundant sorting in subsequent stages
  const sortedCoords = isMulti
    ? sortPolygonsByArea(
        filtered.geometry.coordinates as GeoJSON.Position[][][],
      )
    : undefined

  // 1. HIGH QUALITY: GeoJSON (Max 50 polygons)
  let limitedGeo = filtered
  if (isMulti) {
    limitedGeo = limitPolygons(
      filtered as GeoJSON.Feature<GeoJSON.MultiPolygon>,
      50,
      sortedCoords,
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
      const rings = getMajorRings(filtered, count, sortedCoords)
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
  let lastSimplified: typeof filtered | undefined

  for (const tolerance of simplificationAttempts) {
    const simplified = simplifyBoundary(filtered, tolerance)
    const cleaned = filterDegeneratePolygons(simplified)
    lastSimplified = cleaned

    // Try to keep at least 30 islands even if we have to simplify them
    // Note: We don't use sortedCoords here because the geometry has changed
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
      // Use simplified geometry if Stage 3 failed, to maximize chance of fitting
      const rings = lastSimplified
        ? getMajorRings(lastSimplified, count)
        : getMajorRings(filtered, count, sortedCoords)

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

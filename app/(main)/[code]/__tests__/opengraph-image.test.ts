import { describe, expect, it } from 'vitest'
import { featureConfig } from '@/lib/config'
import { Area } from '@/lib/const'
import {
  encodePolyline,
  filterDegeneratePolygons,
  getBoundingBox,
  getMajorRings,
  limitPolygons,
  sortPolygonsByArea,
  truncateCoordinates,
  truncateGeometryCoordinates,
} from '@/lib/geojson'
import {
  buildPathOverlayUrl,
  isMapboxEnabled,
  toSimplestyleGeoJSON,
} from '@/lib/mapbox'
import { determineAreaByCode } from '@/lib/utils'

// Import the opengraph-image module
const opengraphImageModule = () => import('../opengraph-image')

describe('opengraph-image', () => {
  it('should export required metadata', async () => {
    const ogModule = await opengraphImageModule()

    expect(ogModule.size).toBeDefined()
    expect(ogModule.size.width).toBe(800)
    expect(ogModule.size.height).toBe(400)
    expect(ogModule.contentType).toBe('image/png')
  })

  it('should export default Image function', async () => {
    const ogModule = await opengraphImageModule()

    expect(ogModule.default).toBeDefined()
    expect(typeof ogModule.default).toBe('function')
  })

  it('should handle valid area codes in function signature', () => {
    // Test that the utility function used by opengraph-image works correctly
    expect(determineAreaByCode('11')).toBe('province')
    expect(determineAreaByCode('1101')).toBe('regency')
    expect(determineAreaByCode('110101')).toBe('district')
  })
})

describe('mapbox utilities', () => {
  describe('truncateCoordinates', () => {
    it('should truncate coordinates to specified precision', () => {
      const coords = [123.456789, 45.678912]
      const truncated = truncateCoordinates(coords, 4)
      expect(truncated).toEqual([123.4568, 45.6789])
    })

    it('should default to 4 decimal places', () => {
      const coords = [123.456789, 45.678912]
      const truncated = truncateCoordinates(coords)
      expect(truncated).toEqual([123.4568, 45.6789])
    })
  })

  describe('truncateGeometryCoordinates', () => {
    it('should truncate all coordinates in a polygon', () => {
      const polygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [123.456789, 45.678912],
            [123.456789, 45.678912],
          ],
        ],
      }
      const truncated = truncateGeometryCoordinates(
        polygon,
        2,
      ) as GeoJSON.Polygon
      expect(truncated.coordinates[0][0]).toEqual([123.46, 45.68])
    })
  })

  describe('sortPolygonsByArea', () => {
    it('should sort polygons by area proxy descending', () => {
      const polygons: GeoJSON.Position[][][] = [
        [
          [
            [0, 0],
            [1, 1],
          ],
        ], // Proxy area 1.0
        [
          [
            [0, 0],
            [2, 2],
          ],
        ], // Proxy area 4.0
        [
          [
            [0, 0],
            [0.5, 0.5],
          ],
        ], // Proxy area 0.25
      ]
      const sorted = sortPolygonsByArea(polygons)
      expect(sorted[0][0][1]).toEqual([2, 2])
      expect(sorted[1][0][1]).toEqual([1, 1])
      expect(sorted[2][0][1]).toEqual([0.5, 0.5])
    })
  })

  describe('filterDegeneratePolygons', () => {
    it('should filter out degenerate rings in a polygon', () => {
      const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 0],
            ], // Valid (4 points)
            [
              [0, 0],
              [1, 1],
            ], // Degenerate (2 points)
          ],
        },
      }
      const filtered = filterDegeneratePolygons(
        feature,
      ) as GeoJSON.Feature<GeoJSON.Polygon>
      expect(filtered.geometry.coordinates).toHaveLength(1)
    })

    it('should throw if no valid rings remain', () => {
      const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
            ],
          ],
        },
      }
      expect(() => filterDegeneratePolygons(feature)).toThrow(
        'No valid polygon rings',
      )
    })
  })

  describe('getBoundingBox', () => {
    it('should calculate bbox for a polygon', () => {
      const polygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [100, 0],
            [105, 10],
          ],
        ],
      }
      const bbox = getBoundingBox(polygon)
      expect(bbox).toEqual([100, 0, 105, 10])
    })
  })

  describe('getMajorRings', () => {
    it('should return only the outer rings', () => {
      const feature: GeoJSON.Feature<GeoJSON.MultiPolygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [0, 0],
                [1, 1],
              ],
              [
                [0.1, 0.1],
                [0.2, 0.2],
              ],
            ], // Polygon with hole
          ],
        },
      }
      const rings = getMajorRings(feature)
      expect(rings).toHaveLength(1)
      expect(rings[0]).toEqual([
        [0, 0],
        [1, 1],
      ])
    })
  })

  describe('limitPolygons', () => {
    it('should limit multipolygon to N largest polygons', () => {
      const multiPolygon: GeoJSON.Feature<GeoJSON.MultiPolygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // Tiny area (0.1 x 0.1 = 0.01)
            [
              [
                [0, 0],
                [0.1, 0.1],
              ],
            ],
            // Large area (1 x 1 = 1)
            [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
              ],
            ],
            // Medium area (0.5 x 0.5 = 0.25)
            [
              [
                [0, 0],
                [0.5, 0],
                [0.5, 0.5],
              ],
            ],
          ],
        },
      }

      const limited = limitPolygons(multiPolygon, 2)
      expect(limited.geometry.coordinates).toHaveLength(2)
      // Should keep the two largest by area (1.0 and 0.25)
      expect(limited.geometry.coordinates[0][0]).toHaveLength(4)
      expect(limited.geometry.coordinates[1][0]).toHaveLength(3)
    })
  })

  describe('encodePolyline', () => {
    it('should encode a simple closed ring', () => {
      const ring: GeoJSON.Position[] = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ]

      const encoded = encodePolyline(ring)

      expect(encoded.length).toBeGreaterThan(0)
    })
  })

  describe('buildPathOverlayUrl', () => {
    it('should build a path overlay url', () => {
      const ring: GeoJSON.Position[] = [
        [106.123456, -6.234567],
        [106.234567, -6.234567],
        [106.234567, -6.123456],
        [106.123456, -6.123456],
        [106.123456, -6.234567],
      ]

      const config = featureConfig[Area.PROVINCE]
      if (isMapboxEnabled()) {
        const url = buildPathOverlayUrl([ring], config, {
          width: 800,
          height: 400,
        })
        expect(url).toContain('path-2+')
        expect(url).toContain('/auto/800x400')
        expect(url).toContain('access_token=')
      } else {
        expect(() =>
          buildPathOverlayUrl([ring], config, { width: 800, height: 400 }),
        ).toThrow('Mapbox access token is not configured')
      }
    })
  })

  describe('toSimplestyleGeoJSON', () => {
    it('should convert to simplestyle format', () => {
      const boundary: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [106.123456, -6.234567],
              [106.234567, -6.234567],
              [106.234567, -6.123456],
              [106.123456, -6.123456],
              [106.123456, -6.234567],
            ],
          ],
        },
      }

      const config = featureConfig[Area.PROVINCE]
      const styled = toSimplestyleGeoJSON(boundary, config)

      expect(styled.properties?.stroke).toBe(config.color)
      expect(styled.properties?.['stroke-width']).toBe(2)
      expect(styled.properties?.['stroke-opacity']).toBe(1.0)
      expect(styled.properties?.fill).toBe('#2563eb')
      expect(styled.properties?.['fill-opacity']).toBeCloseTo(0.2, 1)
    })

    it('should truncate coordinates in the output', () => {
      const boundary: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [106.123456789, -6.234567891],
              [106.234567891, -6.234567891],
            ],
          ],
        },
      }

      const config = featureConfig[Area.PROVINCE]
      const styled = toSimplestyleGeoJSON(boundary, config)

      // Check that coordinates are truncated to 4 decimal places
      const coords = (styled.geometry as GeoJSON.Polygon).coordinates[0]
      expect(coords[0][0]).toBe(106.1235)
      expect(coords[0][1]).toBe(-6.2346)
    })
  })

  describe('isMapboxEnabled', () => {
    it('should return a boolean', () => {
      const result = isMapboxEnabled()
      expect(typeof result).toBe('boolean')
    })
  })
})

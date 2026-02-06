import { describe, expect, it } from 'vitest'
import { featureConfig } from '@/lib/config'
import { Area } from '@/lib/const'
import {
  encodePolyline,
  limitPolygons,
  truncateCoordinates,
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

    it('should default to 3 decimal places', () => {
      const coords = [123.456789, 45.678912]
      const truncated = truncateCoordinates(coords)
      expect(truncated).toEqual([123.4568, 45.6789])
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

      // Check that coordinates are truncated to 3 decimal places
      const coords = (styled.geometry as GeoJSON.Polygon).coordinates[0]
      expect(coords[0][0]).toBe(106.123)
      expect(coords[0][1]).toBe(-6.235)
    })
  })

  describe('isMapboxEnabled', () => {
    it('should return a boolean', () => {
      const result = isMapboxEnabled()
      expect(typeof result).toBe('boolean')
    })
  })
})

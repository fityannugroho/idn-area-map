import { describe, expect, it } from 'vitest'
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

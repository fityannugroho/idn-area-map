import { determineAreaByCode } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

// Import the opengraph-image module
const opengraphImageModule = () => import('../opengraph-image')

describe('opengraph-image', () => {
  it('should export required metadata', async () => {
    const module = await opengraphImageModule()
    
    expect(module.size).toBeDefined()
    expect(module.size.width).toBe(800)
    expect(module.size.height).toBe(400)
    expect(module.contentType).toBe('image/png')
  })

  it('should export default Image function', async () => {
    const module = await opengraphImageModule()
    
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })

  it('should handle valid area codes in function signature', () => {
    // Test that the utility function used by opengraph-image works correctly
    expect(determineAreaByCode('11')).toBe('province')
    expect(determineAreaByCode('1101')).toBe('regency')
    expect(determineAreaByCode('110101')).toBe('district')
  })
})
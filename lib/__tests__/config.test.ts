import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('should load umami config from environment variables', async () => {
    process.env.UMAMI_WEBSITE_ID = 'test-id'
    process.env.UMAMI_SCRIPT_URL = 'https://custom.umami/script.js'

    const { config } = await import('../config')
    expect(config.umami.websiteId).toBe('test-id')
    expect(config.umami.scriptUrl).toBe('https://custom.umami/script.js')
  })

  test('should use default scriptUrl if not provided', async () => {
    process.env.UMAMI_WEBSITE_ID = 'test-id'
    delete process.env.UMAMI_SCRIPT_URL

    const { config } = await import('../config')
    expect(config.umami.websiteId).toBe('test-id')
    expect(config.umami.scriptUrl).toBe('https://cloud.umami.is/script.js')
  })
})
